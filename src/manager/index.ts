import * as vscode from "vscode";
// import { hasVslsSpacesExtension, setVsContext } from "../utils";
import { ViewsManager } from "./views";
import { ConfigHelper } from "../config";
import { ChatProviderManager } from "./chat";
import { ZulipChatProvider } from "../zulip";
import { SelfCommands } from "../constants";
import * as utils from "../utils";
import { AuthConfig, Channel, ChannelLabel, ChannelMessagesWithUndefined, CurrentUser, IChatProvider, IManager, InitialState, IStore, LoginResult, MessageReply, Messages, Providers, Team, Topic, User, UserPresence } from "../types";

export default class Manager implements IManager, vscode.Disposable {
    isTokenInitialized: boolean = false;
    viewsManager: ViewsManager;
    chatProviders = new Map<Providers, ChatProviderManager>();
    context: vscode.ExtensionContext;

    constructor(public store: IStore, context: vscode.ExtensionContext) {
        this.viewsManager = new ViewsManager(this, context);
        this.context = context;
    }

    startAuthWithEmailPassword = async (provider: string, config: AuthConfig) => {
        const cp = this.chatProviders.get(provider as Providers);
        const loginResponse = await cp?.loginWithEmailPassword(config);
        if (loginResponse?.result === LoginResult.success) {
            this.updateAllUI();
        } else {
            this.viewsManager.loginWebviewProvider?.loginResponseHandler(loginResponse!);
        }
    };

    getEnabledProviders(newInitialState?: InitialState): InitialState[] {
        // if newInitialState is specified, enabled list must include it
        let currentUserInfos = this.store.getCurrentUserForAll();
        let providerTeamIds: { [provider: string]: string | undefined } = {};

        currentUserInfos.forEach(currentUser => {
            const { provider } = currentUser;

            if (provider !== "vslsSpaces") {
                // This provider is dependent on installed extensions, not the user state
                providerTeamIds[currentUser.provider] = currentUser.currentTeamId;
            }
        });

        const hasVslsSpaces = utils.hasVslsSpacesExtension();

        if (hasVslsSpaces) {
            providerTeamIds[Providers.vslsSpaces] = undefined;
        }

        if (!!newInitialState) {
            providerTeamIds[newInitialState.provider] = newInitialState.teamId;
        }

        if (!!providerTeamIds[Providers.discord]) {
            providerTeamIds[Providers.discord] = undefined;
        }

        return Object.keys(providerTeamIds).map(provider => ({
            provider,
            teamId: providerTeamIds[provider]
        }));
    }

    isProviderEnabled(provider: string): boolean {
        const cp = this.chatProviders.get(provider as Providers);
        return !!cp;
    }

    getCurrentTeamIdFor(provider: string) {
        const currentUser = this.store.getCurrentUser(provider);
        return !!currentUser ? currentUser.currentTeamId : undefined;
    }

    getCurrentUserFor(provider: string) {
        return this.store.getCurrentUser(provider);
    }

    getChatProvider(providerName: Providers) {
        return this.chatProviders.get(providerName);
    }

    instantiateChatProvider(provider: string): IChatProvider {
        switch (provider) {
            case "zulip":
                return new ZulipChatProvider(this);
            default:
                throw new Error(`unsupport chat provider: ${provider}`);
        }
    }

    async validateToken(provider: string, token: string) {
        const chatProvider = this.instantiateChatProvider(provider);
        const currentUser = await chatProvider.validateToken();
        return currentUser;
    }

    isAuthenticated(providerName: string | undefined): boolean {
        const cp = this.chatProviders.get(providerName as Providers);
        return !!cp ? cp.isAuthenticated() : false;
    }

    migrateTokenForSlack = async (teamId: string) => {
        // Migration for 0.10.x
        const teamToken = await ConfigHelper.getToken("slack", teamId);

        if (!teamToken) {
            const slackToken = await ConfigHelper.getToken("slack");

            if (!!slackToken) {
                await ConfigHelper.setToken(slackToken, "slack", teamId);
                await ConfigHelper.clearToken("slack");
            }
        }
    };

    initializeToken = async (newInitialState?: InitialState) => {
        const existingProvider = this.chatProviders.get(Providers.zulip);

        if (!existingProvider) {
            const chatProvider = this.instantiateChatProvider(Providers.zulip);
            const chatManager = new ChatProviderManager(this.store, Providers.zulip, 'MOCK_TEAM_ID', chatProvider, this);
            this.chatProviders.set(Providers.zulip, chatManager);
        }

        this.isTokenInitialized = true;

        this.initializeViewsManager();
    };

    initializeViewsManager = () => {
        const enabledProviders = Array.from(this.chatProviders.keys());
        let providerTeams: { [provider: string]: Team[] } = {};

        enabledProviders.forEach(provider => {
            const chatProvider = this.chatProviders.get(provider);

            if (!!chatProvider) {
                providerTeams[provider] = chatProvider.getTeams();
            }
        });

        this.viewsManager.initialize(enabledProviders, providerTeams);
        this.updateAllUI();

    };

    initializeProviders = async (): Promise<any> => {
        for (let entry of Array.from(this.chatProviders.entries())) {
            let chatProvider = entry[1];

            try {
                await chatProvider.initializeProvider();
            } catch (err) {
                // try-catch will save vsls in case vslsSpaces crashes because
                // it cannot find exports for the vslsSpaces extension.
                console.log(err);
            }
        }
    };

    async initializeStateForAll() {
        for (let entry of Array.from(this.chatProviders.entries())) {
            let chatProvider = entry[1];
            await chatProvider.initializeState();
        }
    }

    subscribePresenceForAll() {
        for (let entry of Array.from(this.chatProviders.entries())) {
            let chatProvider = entry[1];
            chatProvider.subscribeForPresence();
        }
    }

    async updateUserPrefsForAll() {
        for (let entry of Array.from(this.chatProviders.entries())) {
            let chatProvider = entry[1];
            await chatProvider.updateUserPrefs();
        }
    }

    async signout(): Promise<void> {
        const currentUser = this.store.getCurrentUser(Providers.zulip);
        const userInfo = Object.values(this.store.getUsers(Providers.zulip))
            .find(user => user.id === currentUser?.id.toString());
        if (!currentUser) {
            return;
        }

        const option = await vscode.window.showInformationMessage(
            `Sign out ${userInfo?.fullName ?? currentUser!.name}`,
            {
                modal: true,
                detail: `${userInfo?.email ?? ''}\n`,
            },
            'Switch Account...',
            'Sign Out'
        )
        switch (option) {
            case 'Switch Account...':
            case 'Sign Out':
                await this.store.clearProviderState(Providers.zulip);
                utils.setVsContext('chat:loggedIn', false);
                break;
        }
    }

    async signoutFromUri(): Promise<void> {
        await this.store.clearProviderState(Providers.zulip);
        utils.setVsContext('chat:loggedIn', false);
    }

    clearAll() {
        // This method clears local storage for slack/discord, but not vsls
        const enabledProviders = Array.from(this.chatProviders.keys());

        enabledProviders.forEach(provider => {
            this.store.clearProviderState(provider);
            const chatProvider = this.chatProviders.get(provider);

            if (!!chatProvider) {
                chatProvider.destroy();
                this.chatProviders.delete(provider);
            }
        });

        this.isTokenInitialized = false;
    }

    async clearOldWorkspace(provider: string) {
        // Clears users and channels so that we are loading them again
        await this.store.updateUsers(provider, {});
        await this.store.updateChannels(provider, []);
        await this.store.updateLastChannelId(provider, undefined);
    }

    async updateWebviewForProvider(provider: string, channelId: string, typingUserId?: string) {
        const currentUser = this.store.getCurrentUser(provider);
        const channels = this.store.getChannels(provider);
        const channel = channels.find(channel => channel.id === channelId);

        if (!!currentUser && !!channel) {
            await this.store.updateLastChannelId(provider, channelId);
            const users = this.store.getUsers(provider);
            const allMessages = this.getMessages(provider);
            const messages = allMessages[channel.id] || {};
            let typingUser: User | undefined;

            if (typingUserId) {
                typingUser = users[typingUserId];
            }

            this.viewsManager.updateWebview(currentUser, provider, users, channel, messages, typingUser);
        }
    }

    updateStatusItemsForProvider(provider: string) {
        const cp = this.chatProviders.get(provider as Providers);

        if (!!cp) {
            const teams = cp.getTeams();
            teams.forEach(team => {
                this.viewsManager.updateStatusItem(provider, team);
            });
        }
    }

    updateTreeViewsForProvider(provider: string) {
        this.viewsManager.updateTreeViews(provider);
    }

    updateWebViewsForProvider(provider: string) {
        this.viewsManager.updateStreamsWebView(provider);
    }

    updateAllUI() {
        const currentTopic = this.store.getCurrentTopic();
        if (!currentTopic) {
            utils.setVsContext("chat:showThreadSidebar", false);
        } else {
            vscode.commands.executeCommand(SelfCommands.OPEN_WEBVIEW_CHAT, currentTopic)
        }

        const providers = Array.from(this.chatProviders.keys());

        providers.forEach(provider => {
            const lastChannelId = this.store.getLastChannelId(provider);

            if (!!lastChannelId) {
                this.updateWebviewForProvider(provider, lastChannelId);
            }

            this.updateStatusItemsForProvider(provider);
            this.updateTreeViewsForProvider(provider);
            this.updateWebViewsForProvider(provider);
        });
    }

    dispose() {
        this.viewsManager.dispose();
    }

    getChannelLabels(provider: string | undefined): ChannelLabel[] {
        // Return channel labels from all providers if input provider is undefined
        let channelLabels: ChannelLabel[] = [];

        for (let entry of Array.from(this.chatProviders.entries())) {
            const cp = entry[1];
            const providerName = entry[0];

            if (!provider || provider === providerName) {
                channelLabels = [...channelLabels, ...cp.getChannelLabels()];
            }
        }

        return channelLabels;
    }

    getUserForId(provider: string, userId: string) {
        const cachedUser = this.store.getUser(provider, userId);
        return cachedUser;
    }

    getIMChannel(provider: string, user: User): Channel | undefined {
        // DM channels look like `name`
        const channels = this.store.getChannels(provider);
        const { name } = user;
        return channels.find(channel => channel.name === name);
    }

    async createIMChannel(providerName: string, user: User): Promise<Channel | undefined> {
        const cp = this.chatProviders.get(providerName as Providers);
        return !!cp ? await cp.createIMChannel(user) : undefined;
    }

    getUserPresence(provider: string, userId: string) {
        const cp = this.chatProviders.get(provider as Providers);
        return !!cp ? cp.getUserPresence(userId) : undefined;
    }

    getCurrentUserPresence = (provider: string) => {
        const cp = this.chatProviders.get(provider as Providers);
        return !!cp ? cp.getCurrentUserPresence() : undefined;
    };

    updateCurrentWorkspace = async (provider: string, team: Team): Promise<void> => {
        const existingUserInfo = this.getCurrentUserFor(provider);

        if (!!existingUserInfo) {
            const newCurrentUser: CurrentUser = {
                ...existingUserInfo,
                currentTeamId: team.id
            };
            return this.store.updateCurrentUser(provider, newCurrentUser);
        }
    };

    async loadChannelHistory(providerName: string, channelId: string, topic: string | undefined): Promise<void> {
        const cp = this.chatProviders.get(providerName as Providers);
        return !!cp ? cp.loadChannelHistory(channelId, topic) : undefined;
    }

    updateNewChatState(providerName: string, isNewChat: boolean) {
        const cp = this.chatProviders.get(providerName as Providers);
        return !!cp ? cp.updateNewChatState(isNewChat) : undefined;
    }

    async updateReadMarker(providerName: string): Promise<void> {
        const cp = this.chatProviders.get(providerName as Providers);
        return !!cp ? cp.updateReadMarker() : undefined;
    }

    sendMessage = async (
        providerName: string,
        channelId: string | undefined,
        topic: string | undefined,
        content: string,
        parentTimestamp: string | undefined
    ) => {
        const cp = this.chatProviders.get(providerName as Providers);
        return !!cp ? cp.sendMessage(channelId, topic, content, parentTimestamp) : undefined;
    };

    updateSelfPresence = async (providerName: string, presence: UserPresence, durationInMinutes: number) => {
        const cp = this.chatProviders.get(providerName as Providers);
        return !!cp ? cp.updateSelfPresence(presence, durationInMinutes) : undefined;
    };

    addReaction(providerName: string, channelId: string, msgTimestamp: string, userId: string, reactionName: string) {
        const cp = this.chatProviders.get(providerName as Providers);
        return !!cp ? cp.addReaction(channelId, msgTimestamp, userId, reactionName) : undefined;
    }

    removeReaction(
        providerName: string,
        channelId: string,
        msgTimestamp: string,
        userId: string,
        reactionName: string
    ) {
        const cp = this.chatProviders.get(providerName as Providers);
        return !!cp ? cp.removeReaction(channelId, msgTimestamp, userId, reactionName) : undefined;
    }

    async fetchThreadReplies(providerName: string, parentTimestamp: string) {
        const cp = this.chatProviders.get(providerName as Providers);
        return !!cp ? cp.fetchThreadReplies(parentTimestamp) : undefined;
    }

    updateMessageReply(providerName: string, parentTimestamp: string, channelId: string, reply: MessageReply) {
        const cp = this.chatProviders.get(providerName as Providers);
        return !!cp ? cp.updateMessageReply(parentTimestamp, channelId, reply) : undefined;
    }

    updateMessages(providerName: string, channelId: string, messages: ChannelMessagesWithUndefined) {
        const cp = this.chatProviders.get(providerName as Providers);
        return !!cp ? cp.updateMessages(channelId, messages) : undefined;
    }

    clearMessages(providerName: string, channelId: string) {
        const cp = this.chatProviders.get(providerName as Providers);
        return !!cp ? cp.clearMessages(channelId) : undefined;
    }

    updateChannelMarked(provider: string, channelId: string, readTimestamp: string, unreadCount: number) {
        const cp = this.chatProviders.get(provider as Providers);
        return !!cp ? cp.updateChannelMarked(channelId, readTimestamp, unreadCount) : undefined;
    }

    updatePresenceForUser = (providerName: string, userId: string, presence: UserPresence) => {
        const cp = this.chatProviders.get(providerName as Providers);
        return !!cp ? cp.updatePresenceForUser(userId, presence) : undefined;
    };

    getChannel = (provider: string, channelId: string | undefined): Channel | undefined => {
        const cp = this.chatProviders.get(provider as Providers);
        return !!cp ? cp.getChannel(channelId) : undefined;
    };

    fetchUsers = (providerName: string) => {
        const cp = this.chatProviders.get(providerName as Providers);
        return !!cp ? cp.fetchUsers() : undefined;
    };

    fetchChannels = (providerName: string) => {
        const cp = this.chatProviders.get(providerName as Providers);
        return !!cp ? cp.fetchChannels() : undefined;
    };

    getMessages = (providerName: string): Messages => {
        const cp = this.chatProviders.get(providerName as Providers);
        return !!cp ? cp.messages : {};
    };

    getUnreadCount = (provider: string, channel: Channel) => {
        const cp = this.chatProviders.get(provider as Providers);
        return !!cp ? cp.getUnreadCount(channel) : 0;
    };

    getStreams(provider: string): Promise<Channel[]> {
        const cp = this.chatProviders.get(provider as Providers);
        return cp ? cp.fetchStreams() : Promise.resolve([]);
    }

    getTopics(provider: string, streamId: number): Promise<Topic[]> {
        const cp = this.chatProviders.get(provider as Providers);
        return cp ? cp.fetchTopics(streamId) : Promise.resolve([]);
    }
}
