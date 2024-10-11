import { SETTING_AND_SUPPORT_CHANNEL, WORKSPACE_ITEM_CHANNELS } from "../constants";
import { AuthConfig, Channel, ChannelMessages, CurrentUser, IChatProvider, IManager, LoginResponse, Message, Providers, Topic, User, UserPreferences, UserPresence, Users } from "../types";
import { setVsContext } from "../utils";
import ZulipClient from "./client";
import { mockCurrentUser, mockMessage, mockUser1 } from "./mockData";

export class ZulipChatProvider implements IChatProvider {

    private zulipClient: ZulipClient;
    private _manager: IManager;

    constructor(private manager: IManager) {
        this.zulipClient = new ZulipClient(manager.store);
        this._manager = manager;
    }

    public async connect(): Promise<CurrentUser | undefined> {
        const initZulipClient = await this.zulipClient.initZulipClient();

        if (initZulipClient) {
            return Promise.resolve(this._manager.store.getCurrentUser(Providers.zulip));
        }
        return Promise.resolve(undefined);
    }


    async loginWithEmailPassword(config: AuthConfig): Promise<LoginResponse> {

        return this.zulipClient.loginWithEmailPassword(config);
    }

    public async fetchChannels(): Promise<Channel[]> {
        const initZulipClient = await this.zulipClient.initZulipClient();
        if (!initZulipClient) {
            return Promise.resolve([]);
        }
        const privateAIChannels = await this.zulipClient.getPrivateAIChatTopics();
        const streams: Channel[] = await this.zulipClient.getStreams();
        const directMessagesChannels: Channel[] = await this.zulipClient.getDirectMessageChannels();
        return [
            ...privateAIChannels,
            ...streams,
            ...directMessagesChannels,
            ...WORKSPACE_ITEM_CHANNELS,
            ...SETTING_AND_SUPPORT_CHANNEL
        ];
    }

    public async fetchTopics(streamId: number): Promise<Topic[]> {
        const initZulipClient = await this.zulipClient.initZulipClient();
        if (!initZulipClient) {
            return Promise.resolve([]);
        }
        return this.zulipClient.getTopics(streamId);
    }

    public async loadChannelHistory(channelId: string, topic: string | undefined): Promise<ChannelMessages> {
        const initZulipClient = await this.zulipClient.initZulipClient();
        if (!initZulipClient) {
            return Promise.resolve({});
        }
        return this.zulipClient.getConversationHistory(channelId, topic);
    }

    async fetchUsers(): Promise<Users> {
        const initZulipClient = await this.zulipClient.initZulipClient();
        if (!initZulipClient) {
            return Promise.resolve({});
        }
        return await this.zulipClient.getUsers();
    }

    public async sendMessage(
        channelId: string | undefined,
        topic: string | undefined,
        content: string,
    ): Promise<void> {
        if (this.zulipClient.getIsNewChat()) {
            const user = this._manager.store.getCurrentUser(Providers.zulip);
            const privateAIChatTopics = (await this.zulipClient.getPrivateAIChatTopics()).filter(topic => {
                return (!user?.name) ? false : topic.name.includes(user?.name);
            })
            return this.zulipClient.createNewTopic(channelId, content, user, privateAIChatTopics);
        }
        return this.zulipClient.sendMessage(
            channelId, topic, content
        );
    }

    public updateNewChatState(isNewChat: boolean) {
        this.zulipClient.setIsNewChat(isNewChat);
    }

    async validateToken(): Promise<CurrentUser | undefined> {
        return Promise.resolve(mockCurrentUser);
    }

    public fetchUserInfo(userId: string): Promise<User | undefined> {
        return Promise.resolve(mockUser1);
    }

    public fetchChannelInfo(channel: Channel): Promise<Channel | undefined> {
        return Promise.resolve(undefined);
    }

    public getUserPreferences(): Promise<UserPreferences | undefined> {
        return Promise.resolve({});
    }

    public markChannel(
        channel: Channel,
        timestamp: string
    ): Promise<Channel | undefined> {
        return Promise.resolve(undefined);
    }

    public fetchThreadReplies(
        channelId: string,
        timestamp: string
    ): Promise<Message | undefined> {
        return Promise.resolve(mockMessage);
    }

    async sendTyping(currentUserId: string, channelId: string) { }


    public sendThreadReply(
        text: string,
        currentUserId: string,
        channelId: string,
        parentTimestamp: string
    ) {
        return Promise.resolve();
    }

    public isConnected(): boolean {
        return !!this.zulipClient.zulipClient;
    }

    public async updateSelfPresence(
        presence: UserPresence,
        durationInMinutes: number
    ): Promise<UserPresence | undefined> {
        return Promise.resolve(UserPresence.available);
    }

    public subscribePresence(users: Users) {
        return;
    }

    public createIMChannel(user: User): Promise<Channel | undefined> {
        return Promise.resolve(undefined);
    }


    public destroy(): Promise<void> {
        return Promise.resolve();
    }

    public async aiCompleteCode(userPrompt: string): Promise<string> {
        const initZulipClient = await this.zulipClient.initZulipClient();
        if (!initZulipClient) {
            return '';
        }
        return await this.zulipClient.aiCompleteCode(userPrompt);
    }
}
