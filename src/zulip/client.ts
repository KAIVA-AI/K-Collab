import * as vscode from "vscode";
import { COMTOR_BOT_TAG_NAME, PRIVATE_AI_BOT_TAG_NAME, PRIVATE_AI_CHAT_STREAM, SETTING_AND_SUPPORT_CHANNEL, SelfCommands, WORKSPACE_ITEM_CHANNELS } from "../constants";
import Logger from "../../src/logger";
import { getDirectRecipientIds, getPrivateAIStreamId, getResourceUrl, setVsContext } from "../utils";
import { wrapCodeContext } from "../code/generate";
import zulip from '../zulip-js';
import { AuthConfig, Channel, ChannelLabelType, ChannelMessages, ChannelMessagesWithUndefined, ChannelType, CurrentUser, IStore, LoginResponse, LoginResult, Message, MessageNarrow, MessageRelyType, Providers, Topic, User, UserPresence, Users } from "../types";

enum EventQueueType {
    message = "message",
    update_message = "update_message",
    delete_message = "delete_message",
}

interface ISnoozeAPIResponse {
    ok: boolean;
    snooze_enabled: boolean;
    snooze_endtime: number;
    snooze_remaining: number;
}

const CHANNEL_HISTORY_LIMIT = 50;
const MESSAGES_HISTORY_LIMIT = 200;

const USER_LIST_LIMIT = 1000;

// User-defined type guard
// https://github.com/Microsoft/TypeScript/issues/20707#issuecomment-351874491
function notUndefined<T>(x: T | undefined): x is T {
    return x !== undefined;
}

const getFile = (rawFile: any) => {
    return { name: rawFile.name, permalink: rawFile.permalink };
};

const getContent = (attachment: any) => {
    return {
        author: attachment.author_name,
        authorIcon: attachment.author_icon,
        pretext: attachment.pretext,
        title: attachment.title,
        titleLink: attachment.title_link,
        text: attachment.text,
        footer: attachment.footer,
        borderColor: attachment.color
    };
};

const getReaction = (reaction: any) => ({
    name: `:${reaction.name}:`,
    count: reaction.count,
    userIds: reaction.users
});

const getUser = (member: any): User => {
    const { id, profile, real_name, name, deleted } = member;
    const { display_name, image_72, image_24 } = profile;

    return {
        id,
        // Conditional required for bots like @paperbot
        name: display_name ? display_name : name,
        email: profile.email,
        fullName: real_name,
        internalName: name,
        imageUrl: image_72,
        smallImageUrl: image_24,
        presence: UserPresence.unknown,
        isDeleted: deleted
    };
};

export default class ZulipClient {
    zulipClient: any;

    private channels: Channel[] = [];
    private _channelId: string | undefined;
    private _topic: string | undefined;
    private _isNewChat: boolean = false;

    constructor(private store: IStore) {
        console.log("ZulipClient constructor");
    }

    initZulipClient = async (): Promise<boolean> => {
        try {
            if (!this.zulipClient) {
                const authConfig = this.store.getAuthConfig();
                if (authConfig) {
                    const loginResponse = await this.loginWithEmailPassword(authConfig);
                    return loginResponse.result === LoginResult.success;
                } else {
                    setVsContext('chat:loggedIn', false);
                    return false;
                }
            }
        } catch (error) {
            console.log(error);
        }
        return true;
    };

    loginWithEmailPassword = async (config: AuthConfig): Promise<LoginResponse> => {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        try {
            this.zulipClient = await zulip(config);
            const userProfile = await this.zulipClient.users.me.getProfile();
            // TODO: update user profile to data storage
            if (!!userProfile.user_id && userProfile.is_active) {
                setVsContext('chat:loggedIn', true);
                this.store.updateAuthConfig(config);
                this.store.updateCurrentUser(Providers.zulip, {
                    id: userProfile.user_id,
                    name: userProfile.full_name,
                    teams: [],
                    currentTeamId: undefined,
                    provider: Providers.zulip
                });
                this.subscribeEventQueue(this.handleEventQueue);
                return { result: LoginResult.success };
            } else {
                this.store.updateCurrentUser(Providers.zulip, undefined);
                return { result: LoginResult.error, errorMessage: 'Login error, please check your username and password and try again!' };
            }
        } catch (error: any) {
            this.store.updateCurrentUser(Providers.zulip, undefined);
            return { result: LoginResult.error, errorMessage: `${error.message} ${error.stack}` };
        }
    }

    getStreams = async (): Promise<Channel[]> => {
        try {
            const streams = await this.zulipClient.streams.retrieve({
                include_subscribed: true,
                include_public: false
            });
            if (streams.result === 'success' && streams.streams) {
                const channels = streams.streams
                    // Remove Private AI Chat stream
                    .filter((stream: any) => stream.name !== PRIVATE_AI_CHAT_STREAM)
                    .map((stream: any) => {
                        return {
                            id: stream.stream_id.toString(),
                            name: stream.name ?? '',
                            type: ChannelType.stream,
                            readTimestamp: stream.date_created,
                            unreadCount: stream.unreadCount ?? 0,
                            channelLabelType: stream.invite_only
                                ? ChannelLabelType.private
                                : ChannelLabelType.general,
                        };
                    });
                this.channels = [...channels];
                return channels;
            }
        } catch (error) {
            Logger.log(`getStreams error: ${error}`);
        }
        return [];
    }

    /**
     * Retrieves the topics for the private AI chat stream.
     * 
     * This makes a call to the Zulip API to get the topics for the stream
     * with the name PRIVATE_AI_CHAT_STREAM. It maps the response to an array
     * of Channel objects (id with format: privateAIStreamId_topicName).
     */
    getPrivateAIChatTopics = async (): Promise<Channel[]> => {
        try {
            const privateAIStreamId = await this.getStreamId(PRIVATE_AI_CHAT_STREAM);
            this.store.updatePrivateAIStreamId(privateAIStreamId);
            const response = await this.zulipClient.streams.topics.retrieve({ stream_id: privateAIStreamId });
            if (response.result === 'success' && !!response.topics) {
                let topics = response.topics.map((topic: any): Channel => {
                    return {
                        id: `${privateAIStreamId}_${topic.name ?? ''}`,
                        name: topic.name ?? '',
                        type: ChannelType.privateAI
                    };
                });

                topics = topics.filter((topic: any) => {
                    return topic.name.includes(this.store.getCurrentUser(Providers.zulip)?.name);
                })

                return topics;
            }
        } catch (error) {
            Logger.log(`getTopicss Private AI Chat error: ${error}`);
        }
        return [];
    }

    // Todo: get Private AI stream info using custom api (currently zulip-js doesn't support)
    getStream(streamId: string): Channel | undefined {
        return this.channels.find((channel: Channel) => channel.id === streamId);
    }

    /**
     * Retrieves the stream ID for the given stream name.
     * 
     * Makes a call to the Zulip API to get the stream ID for the stream 
     * with the provided name. Returns the stream ID if successful, 
     * otherwise returns undefined.
     */
    async getStreamId(streamName: string): Promise<number | undefined> {
        try {
            const response = await this.zulipClient.streams.getStreamId(streamName);
            if (response && response.result === 'success') {
                return response!.stream_id;
            }
        } catch (error) {
            Logger.log(`getStreamId Private AI Chat error: ${error}`);
        }
    }

    getTopics = async (streamId: number): Promise<Topic[]> => {
        try {
            const response = await this.zulipClient.streams.topics.retrieve({ stream_id: streamId });
            if (response.result === 'success' && !!response.topics) {
                const topics = response.topics.map((topic: any): Topic => {
                    return {
                        maxId: topic.max_id.toString(),
                        name: topic.name ?? ''
                    };
                });
                return topics;
            }
        } catch (error) {
            Logger.log(`getTopicss error: ${error}`);
        }
        return [];
    }

    getConversationHistory = async (
        channelId: string,
        topic: string | undefined
    ): Promise<ChannelMessages> => {
        this._channelId = channelId;
        this._topic = topic;

        const channels = this.store.getChannels(Providers.zulip);
        const channel = channels.find(channel => channel.id === channelId);
        if (!channel) {
            return {};
        }
        let channelMessages: ChannelMessages = {};
        switch (channel!.type) {
            case ChannelType.privateAI:
            case ChannelType.stream:
                const channelId: number | undefined = channel!.type === ChannelType.privateAI
                    ? getPrivateAIStreamId(channel!.id)
                    : parseInt(channel!.id);

                if (!channelId) {
                    return {};
                }

                const narrow = [
                    { operator: "stream", operand: channelId!, negated: false } as MessageNarrow,
                ];
                if (!!topic) {
                    narrow.push({ operator: "topic", operand: topic, negated: false } as MessageNarrow);
                }
                try {
                    const response = await this.getMessages(narrow, CHANNEL_HISTORY_LIMIT);
                    const { result, messages: messageData } = response;
                    if (result === 'success') {
                        channelMessages = this.getChannelMessagesFromRaw(messageData, topic);
                    }
                } catch (error) {
                    Logger.log(`getConversationHistory error: ${error}`);
                }
                break;
            case ChannelType.directMessage:
                try {
                    const recipientIds = channel!.id
                        .replace('im_', '')
                        .split(',')
                        .map((str) => parseInt(str));
                    const narrow: MessageNarrow[] = [
                        {
                            "operator": "dm",
                            "operand": recipientIds
                        }
                    ];
                    const response = await this.getMessages(narrow, CHANNEL_HISTORY_LIMIT);
                    const { result, messages: messageData } = response;
                    if (result === 'success') {
                        channelMessages = this.getChannelMessagesFromRaw(messageData, topic);
                    }
                } catch (error) {
                    Logger.log(`getConversationHistory error: ${error}`);
                }
                break;
            default:
                break;
        }
        return channelMessages;

    };

    getUsers = async (): Promise<Users> => {
        let usersResult: Users = {};
        try {
            const response: any = await this.zulipClient.users.retrieve({
                client_gravatar: false
            })
            if (response.result === 'success') {
                response.members.forEach((user: any) => {
                    const userId = user.user_id.toString();
                    const userInfo: User = {
                        id: userId,
                        name: user.full_name,
                        email: user.email,
                        fullName: user.full_name,
                        imageUrl: getResourceUrl(user.avatar_url),
                        smallImageUrl: getResourceUrl(user.avatar_url),
                        presence: user.is_active ? UserPresence.available : UserPresence.offline,
                        isBot: user.is_bot,
                    };
                    usersResult[userId] = userInfo;
                })
            }
        } catch (error) {
            Logger.log(`getUsers error: ${error}`);
        }
        return usersResult;
    }

    subscribeEventQueue = async (
        callback: (event: any) => void
    ): Promise<any> => {
        let attempts = 5;
        let queueId: string | null = null;
        let lastEventId: number | null = null;

        while (true) {
            if (!queueId) {
                [queueId, lastEventId] = await this.registerEventQueue(["message", "update_message", "delete_message"], ["VietIS-Comtor"]);
            }

            try {
                const payload = await this.getEventQueue(queueId!, lastEventId!);
                for (const event of payload.events) {
                    lastEventId = Math.max(
                        lastEventId!, Number(event.id));
                    if (event.type === 'heartbeat') {
                        continue;
                    }
                    callback(event);
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                Logger.log(`subscribeEventQueue error: ${error}`);
                Logger.log('Start rertry after 1 second');
                attempts -= 1;
                if (attempts <= 0) {
                    return Promise.reject(error);
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

        }
    }

    registerEventQueue = async (event_types: string[], sender_apply_raw_content: [string]): Promise<any> => {
        let attempts = 5;
        while (true) {
            try {
                const params = {
                    event_types: event_types,
                    apply_markdown: "true",
                    sender_apply_raw_content: sender_apply_raw_content
                };
                const { queue_id: queueId, last_event_id: lastEventId } = await this.zulipClient.queues.register(params);
                if (!!queueId && !!lastEventId) {
                    return [
                        queueId,
                        lastEventId,
                    ];
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                Logger.log(`registerEventQueue error: ${error}`);
                Logger.log('Start rertry after 1 second');
                attempts -= 1;
                if (attempts <= 0) {
                    return Promise.reject(error);
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    };

    getEventQueue = async (queue_id: String, lastEventId: number): Promise<any> => {
        try {
            const eventParams = {
                queue_id,
                last_event_id: lastEventId,
            };
            const events = await this.zulipClient.events.retrieve(eventParams);
            return events;
        } catch (error) {
            Logger.log(`getEventQueue error: ${error}`);
        }
    }

    deleteEventQueue = async (queueId: string): Promise<any> => {
        try {
            const deregisterParams = {
                queue_id: queueId,
            };
            const result = await this.zulipClient.queues.deregister(deregisterParams)
            return result;
        } catch (error) {
            Logger.log(`deleteEventQueue error: ${error}`);
        }
    }

    handleEventQueue = async (event: any) => {
        const { type, message, stream_id, rendered_content, user_id, edit_timestamp } = event;
        switch (type) {
            case EventQueueType.message:
                this.handleUpdateMessages(message);
                break;
            case EventQueueType.update_message:
                break;
            case EventQueueType.delete_message:
                break;
            default:
                break;
        }
    }

    handleUpdateMessages = async (data: any) => {
        switch (data.type) {
            case MessageRelyType.stream:
                const newMessages: ChannelMessagesWithUndefined = this.getChannelMessagesWithUndefinedFromRaw([data], this._topic);
                /**
                 * Get the stream ID for the message. 
                 * If it is a private AI chat message, conFcatenate the stream ID and subject.
                 * Otherwise, just use the stream ID.
                 */
                const streamId = data.display_recipient === PRIVATE_AI_CHAT_STREAM
                    ? `${data.stream_id}_${data.subject}`
                    : data.stream_id;
                vscode.commands.executeCommand(SelfCommands.UPDATE_MESSAGES, {
                    channelId: streamId,
                    messages: newMessages,
                    provider: Providers.zulip
                });
                break;
            case MessageRelyType.private:
                const { display_recipient: displayRecipient } = data;
                const currentUser = this.store.getCurrentUser(Providers.zulip);
                const filterRecipient = displayRecipient.filter((recipient: any) => {
                    if (displayRecipient.length >= 2) {
                        return currentUser?.id !== recipient.id
                    }
                    return true;
                });
                const ids = getDirectRecipientIds(filterRecipient);

                const directMessages: ChannelMessagesWithUndefined = this.getChannelMessagesWithUndefinedFromRaw([data], this._topic);
                vscode.commands.executeCommand(SelfCommands.UPDATE_MESSAGES, {
                    channelId: ids,
                    messages: directMessages,
                    provider: Providers.zulip
                });
                break;
            default:
                break;
        }
    }

    sendMessage = async (
        channelId: string | undefined,
        topic: string | undefined,
        content: string,
    ): Promise<any> => {
        try {
            const channels = this.store.getChannels(Providers.zulip);
            const channel = channels.find(channel => channel.id === channelId);
            if (!channel) {
                return {};
            }
            switch (channel.type) {
                case ChannelType.privateAI:
                case ChannelType.stream:
                    const isPrivateAIChat = channel.type === ChannelType.privateAI;
                    const streamId = isPrivateAIChat
                        ? getPrivateAIStreamId(channel!.id)
                        : parseInt(channel!.id);

                    const promtWithContextMessage = wrapCodeContext();

                    let buildContent;
                    if (channel.type === ChannelType.privateAI) {
                        buildContent = content.includes(PRIVATE_AI_BOT_TAG_NAME)
                            ? `${content}`
                            : `${PRIVATE_AI_BOT_TAG_NAME} \n ${promtWithContextMessage} \n ${content}`
                    } else {
                        buildContent = content.includes(PRIVATE_AI_BOT_TAG_NAME) ? `${content}` : `${COMTOR_BOT_TAG_NAME} ${content}`;
                    }

                    if (!streamId) {
                        return;
                    }
                    const streamParams = {
                        // stream_id: streamId!, need add to context branch
                        to: streamId!,
                        type: MessageRelyType.stream,
                        topic: topic,
                        content: buildContent,
                    };

                    await this.zulipClient.messages.send(streamParams);
                    break;
                case ChannelType.directMessage:
                    const recipientIds = channel!.id
                        .replace('im_', '')
                        .split(',')
                        .map((str) => parseInt(str));

                    channelId = (channelId || '')
                        .replace('im_', '')

                    const directParams = {
                        stream_id: channelId,
                        to: recipientIds,
                        type: MessageRelyType.direct,
                        content: content
                    };

                    await this.zulipClient.messages.send(directParams);
                    break;
                default:
                    break;
            }
        } catch (error) {
            Logger.log(`sendMessage error: ${error}`);
        }
    }

    async aiCompleteCode(userPrompt: string): Promise<string> {
        const response = await this.zulipClient.callEndpoint('/ai/complete-code', 'POST', { user_prompt: userPrompt });
        return response.code;
    }

    createNewTopic = async (streamId: string | undefined, content: string, user: CurrentUser | undefined, privateTopics: Channel[]): Promise<void> => {
        if (!streamId) {
            return;
        }

        const topic = `${user?.name}-${privateTopics.length + 1}`;
        const chanelId = `${streamId}_${topic}`;
        const promtWithContextMessage = wrapCodeContext();
        const buildContent = `${PRIVATE_AI_BOT_TAG_NAME} \n ${promtWithContextMessage} \n ${content}`;
        const newChannel: Channel = {
            id: chanelId,
            name: topic,
            type: ChannelType.privateAI,
        }
        const streamParams = {
            to: parseInt(streamId!),
            // stream_id: parseInt(streamId!), need add to context branch
            type: MessageRelyType.stream,
            topic: topic,
            content: buildContent,
        };

        const currentChannels = this.store.getChannels(Providers.zulip);
        this._topic = topic;
        this._isNewChat = false;
        this.store.updateChannels(Providers.zulip, [...currentChannels, JSON.parse(JSON.stringify(newChannel))]);
        this.updateState(chanelId, topic);

        try {
            const response = await this.zulipClient.messages.send(streamParams);
            if (!response || response.result !== 'success') {
                this.restoreState(streamId, currentChannels);
            }
        } catch (error) {
            this.restoreState(streamId, currentChannels);
            Logger.log(`createNewTopic error: ${error}`);
        }
    }

    updateState = (channelId: string, topic: string | undefined) => {
        this.store.updateLastChannelId(Providers.zulip, channelId);
        vscode.commands.executeCommand(SelfCommands.UPDATE_CURRENT_STATE, {
            providerName: Providers.zulip,
            channelId: channelId,
            topic: topic,
        });
    }

    restoreState = (streamId: string, currentChannels: Channel[]) => {
        this._topic = undefined;
        this._isNewChat = false;
        this.store.updateChannels(Providers.zulip, currentChannels);
        this.updateState(streamId, undefined);
    }

    getDirectMessageChannels = async (): Promise<Channel[]> => {
        // TODO: using recursive alogrithm to get all direct messages, currently limit 200 messages
        const narrow = [
            {
                operator: "is",
                operand: "dm"
            }
        ];
        try {
            const response = await this.getMessages(narrow);
            const { result, messages: messageData } = response;
            if (result === 'success') {
                return this.groupChannelsFromDirectMessages(messageData);
            }
        } catch (error) {
            Logger.log(`getDirectMessages error: ${error}`);
        }
        return [];
    }

    getMessages = async (narrow: MessageNarrow[], limit: number = MESSAGES_HISTORY_LIMIT): Promise<any> => {
        const readParams = {
            anchor: "newest",
            num_before: limit,
            num_after: 0,
            narrow: narrow,
            apply_markdown: true,
            sender_apply_raw_content: JSON.stringify(["VietIS-Comtor"])
        };
        const response = await this.zulipClient.messages.retrieve(readParams);
        return response;
    }

    groupChannelsFromDirectMessages = (messagesData: any): Channel[] => {
        const recipientIds: string[] = [];
        const channels: Channel[] = [];
        const users = this.store.getUsers(Providers.zulip);
        const humanIds = Object.values(users)
            .filter((user: User) => {
                return !user.isBot;
            })
            .map((user) => user.id);
        const currentUser = this.store.getCurrentUser(Providers.zulip);
        messagesData.forEach((parsedData: any) => {
            const {
                display_recipient: displayRecipient,
                timestamp
            } = parsedData;

            const filterRecipient = displayRecipient.filter((recipient: any) => {
                if (displayRecipient.length >= 2) {
                    return currentUser?.id !== recipient.id
                }
                return true;
            });
            const ids = getDirectRecipientIds(filterRecipient);

            if (!recipientIds.includes(ids)) {
                recipientIds.push(ids);

                const isGroup = filterRecipient.length > 1;
                const isHuman = filterRecipient.length === 1 && humanIds.includes(filterRecipient[0].id.toString());

                const recipientName = filterRecipient.map((recipient: any) => {
                    return recipient.full_name || recipient.email;
                }).join(', ');

                const channelLabelType = isGroup
                    ? ChannelLabelType.group
                    : (isHuman ? ChannelLabelType.userOnline : ChannelLabelType.bot);

                channels.push({
                    id: ids,
                    name: recipientName,
                    type: ChannelType.directMessage,
                    readTimestamp: timestamp,
                    unreadCount: 0,
                    channelLabelType
                });
            }
        })
        return channels;
    }

    getIsNewChat = (): boolean => {
        return this._isNewChat;
    }

    setIsNewChat = (isNewChat: boolean) => {
        this._isNewChat = isNewChat;
    }

    getChannelMessagesFromRaw = (messagesData: any, topic: string | undefined = undefined): ChannelMessages => {
        let channelMessages: ChannelMessages = {};
        messagesData.forEach((parsedData: any) => {
            const { timestamp, sender_id, content, subject, id } = parsedData;
            if (!!topic) {
                if (subject === topic && !!sender_id) {
                    const id = parsedData.id;
                    const message: Message = {
                        timestamp: timestamp.toString(),
                        userId: sender_id.toString(),
                        text: content,
                        topic: subject,
                        isEdited: false,
                        attachment: undefined,
                        content: undefined,
                        reactions: [],
                        replies: {},
                    }
                    channelMessages[id] = message;
                }
            } else if (!!sender_id) {
                const message: Message = {
                    timestamp: timestamp.toString(),
                    userId: sender_id.toString(),
                    text: content,
                    topic: undefined,
                    isEdited: false,
                    attachment: undefined,
                    content: undefined,
                    reactions: [],
                    replies: {},
                }
                channelMessages[id] = message;
            }
        });
        return channelMessages;
    }

    getChannelMessagesWithUndefinedFromRaw = (messagesData: any, topic: string | undefined = undefined): ChannelMessagesWithUndefined => {
        let channelMessages: ChannelMessagesWithUndefined = {};

        messagesData.forEach((parsedData: any) => {
            const { timestamp, sender_id, content, subject, id } = parsedData;

            if (!!topic) {
                if (subject === topic && !!sender_id) {
                    const message: Message = {
                        timestamp: timestamp.toString(),
                        userId: sender_id.toString(),
                        text: content,
                        topic: subject,
                        isEdited: false,
                        attachment: undefined,
                        content: undefined,
                        reactions: [],
                        replies: {}
                    }
                    channelMessages[id] = message;
                }
            } else if (!!sender_id) {
                const message: Message = {
                    timestamp: timestamp.toString(),
                    userId: sender_id.toString(),
                    text: content,
                    topic: undefined,
                    isEdited: false,
                    attachment: undefined,
                    content: undefined,
                    reactions: [],
                    replies: {}
                }
                channelMessages[id] = message;
            }
        });
        return channelMessages;
    }
}
