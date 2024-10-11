export interface IChatProvider {
    loginWithEmailPassword: (config: AuthConfig) => Promise<LoginResponse>;
    validateToken: () => Promise<CurrentUser | undefined>;
    fetchUsers: () => Promise<Users>;
    fetchUserInfo: (userId: string) => Promise<User | undefined>;
    fetchChannels: () => Promise<Channel[]>;
    fetchChannelInfo: (channel: Channel) => Promise<Channel | undefined>;
    fetchTopics: (streamId: number) => Promise<Topic[]>;
    loadChannelHistory: (channelId: string, topic: string | undefined) => Promise<ChannelMessages>;
    updateNewChatState: (isNewChat: boolean) => void;
    getUserPreferences: () => Promise<UserPreferences | undefined>;
    markChannel: (channel: Channel, ts: string) => Promise<Channel | undefined>;
    fetchThreadReplies: (channelId: string, ts: string) => Promise<Message | undefined>;
    sendMessage: (channelId: string | undefined, topic: string | undefined, content: string) => Promise<void>;
    sendTyping: (currentUserId: string, channelId: string) => Promise<void>;
    sendThreadReply: (text: string, currentUserId: string, channelId: string, parentTimestamp: string) => Promise<void>;
    connect: () => Promise<CurrentUser | undefined>;
    isConnected: () => boolean;
    updateSelfPresence: (presence: UserPresence, durationInMinutes: number) => Promise<UserPresence | undefined>;
    subscribePresence: (users: Users) => void;
    createIMChannel: (user: User) => Promise<Channel | undefined>;
    destroy: () => Promise<void>;
    aiCompleteCode?: (userPrompt: string) => Promise<string>;
}

export const enum UserPresence {
    unknown = "unknown",
    available = "available",
    idle = "idle",
    doNotDisturb = "doNotDisturb",
    invisible = "invisible",
    offline = "offline"
}

export interface User {
    id: string;
    name: string;
    email?: string; // Discord does not have emails, hence the ?
    fullName: string;
    internalName?: string; // Used by slack provider to associate DMs
    imageUrl: string;
    smallImageUrl: string;
    presence: UserPresence;
    isBot?: boolean;
    isDeleted?: boolean;
    roleName?: string;
}

export interface UserPreferences {
    mutedChannels?: string[];
}

export const enum Providers {
    zulip = "zulip",
    slack = "slack",
    discord = "discord",
    vslsSpaces = "vslsSpaces"
}

export interface CurrentUser {
    id: string;
    name: string;
    teams: Team[];
    currentTeamId: string | undefined;
    provider: Providers;
}

export interface Team {
    // Team represents workspace for Slack, guild for Discord
    id: string;
    name: string;
}

export interface Users {
    [id: string]: User;
}

export interface MessageAttachment {
    name: string;
    permalink: string;
}

export interface MessageContent {
    author: string;
    authorIcon?: string;
    pretext: string;
    title: string;
    titleLink: string;
    text: string;
    footer: string;
    borderColor?: string;
}

export interface MessageReaction {
    name: string;
    count: number;
    userIds: string[];
}

export interface MessageReply {
    userId: string;
    timestamp: string;
    text?: string;
    attachment?: MessageAttachment;
}

export interface MessageReplies {
    [timestamp: string]: MessageReply;
}

export interface Message {
    timestamp: string;
    userId: string;
    text: string;
    topic: string | undefined;
    isEdited?: Boolean;
    attachment?: MessageAttachment;
    content: MessageContent | undefined;
    reactions: MessageReaction[];
    replies: MessageReplies;
}

export interface ChannelMessages {
    [timestamp: string]: Message;
}

export interface ChannelMessagesWithUndefined {
    [timestamp: string]: Message | undefined;
}

export interface Messages {
    [channelId: string]: ChannelMessages;
}

export const enum ChannelType {
    group = "group",
    stream = "stream",
    directMessage = "directMessage",
    support = "support",
    privateAI = "privateAI"
}

export const enum NotableMark {
    allMessage = 'allMessage',
    drafts = 'drafts',
    inbox = 'inbox',
    mentions = 'mentions',
    recent = 'recent',
    starred = 'starred',
}

export const enum ChannelLabelType {
    general = "general",
    private = "private",
    group = "group",
    bot = "bot",
    userOnline = "userOnline",
    userOffline = "userOffline"
}

interface IContactMetadata {
    id: string;
    email: string;
}

export interface Channel {
    id: string;
    name: string;
    type: ChannelType;
    readTimestamp?: string | undefined;
    unreadCount?: number;
    streamName?: string; // for Streams
    contactMetadata?: IContactMetadata; // for Live Share DMs
    notableMark?: NotableMark; // For notable section to show fix icons
    channelLabelType?: ChannelLabelType; // For chanel section to show fix icons
    settingAndSupportType?: SettingAndSupportType; // For setting and support section to show icons
    topics?: Topic[];
}
export interface Topic {
    id?: string;
    name: string;
    maxId: number,
}

export const enum SettingAndSupportType {
    logout = "logout",
    keyboardShortcuts = "keyboardShortcuts",
    settings = "settings",
    usage = "usage",
}

export interface ChannelLabel {
    channel: Channel;
    providerName: string;
    teamName: string;
    unread: number;
    label: string;
    presence: UserPresence;
}
const enum MessageType {
    text = "text",
    thread_reply = "thread_reply",
    command = "command",
    link = "link",
    internal = "internal"
}

interface ExtensionMessage {
    type: MessageType;
    text: string;
}

export interface UIMessage {
    fontFamily: string;
    fontSize: string;
    provider: string;
    messages: ChannelMessages;
    users: Users;
    channel: Channel;
    currentUser: CurrentUser;
    statusText: string;
    // atMentions: User[];
}

interface UIMessageDateGroup {
    groups: UIMessageGroup[];
    date: string;
}

interface UIMessageGroup {
    messages: Message[];
    userId: string;
    user: User;
    minTimestamp: string;
    key: string;
}

export interface IStore {
    installationId: string | undefined; // TODO: remove undefined
    existingVersion: string | undefined;
    generateInstallationId: () => string;
    getCurrentUser: (provider: string) => CurrentUser | undefined;
    getCurrentUserForAll: () => CurrentUser[];
    getUsers: (provider: string) => Users;
    getUser: (provider: string, userId: string) => User | undefined;
    getChannels: (provider: string) => Channel[];
    getLastChannelId: (provider: string) => string | undefined;
    getMessageHistoryForChannel: (channelId: string) => ChannelMessages;
    getAuthConfig: () => AuthConfig | undefined;
    getPrivateAIStreamId: () => number | undefined;
    getCurrentTopic: () => ChatArgs | undefined;
    getLanguageComtorSetting: () => [] | undefined;
    updateUsers: (provider: string, users: Users) => Thenable<void>;
    updateUser: (provider: string, userId: string, user: User) => void;
    updateChannels: (provider: string, channels: Channel[]) => Thenable<void>;
    updateCurrentUser: (provider: string, userInfo: CurrentUser | undefined) => Thenable<void>;
    updateLastChannelId: (provider: string, channelId: string | undefined) => Thenable<void>;
    updateAuthConfig: (authConfig: AuthConfig | undefined) => void;
    updatePrivateAIStreamId: (streamId: number | undefined) => void;
    clearProviderState: (provider: string) => Promise<void>;
    updateExtensionVersion: (version: string) => Thenable<void>;
    updateMessageHistory: (channelId: string, messages: ChannelMessages) => Thenable<void>;
    updateCurrentTopic: (chatArgs: ChatArgs | undefined) => void;
    updateLanguageComtorSetting: (languageArgs: []) => void;
}

export interface IManager {
    isTokenInitialized: boolean;
    store: IStore;
    isAuthenticated: (provider: string) => boolean;
    getChannel: (provider: string, channelId: string | undefined) => Channel | undefined;
    getIMChannel: (provider: string, user: User) => Channel | undefined;
    getChannelLabels: (provider: string) => any;
    getStreams: (provider: string) => Promise<Channel[]>;
    getTopics: (provider: string, streamId: number) => Promise<Topic[]>;
    getUnreadCount: (provider: string, channel: Channel) => number;
    getCurrentUserFor: (provider: string) => CurrentUser | undefined;
    getUserPresence: (provider: string, userId: string) => UserPresence | undefined;
    getCurrentUserPresence: (provider: string) => UserPresence | undefined;
    updateAllUI: () => void;
    updateTreeViewsForProvider: (provider: string) => void;
    updateStatusItemsForProvider: (provider: string) => void;
    updateWebViewsForProvider: (provider: string) => void;
    updateWebviewForProvider: (provider: string, channelId: string) => void;
    getMessages: (provider: string) => Messages;
}

export interface IViewsManager {
    updateTreeViews: (provider: string) => void;
    updateWebview: (provider: string) => void;
    updateStatusItem: (provider: string, team: Team) => void;
}

export interface ChatArgs {
    channelId?: string;
    user?: User;
    providerName: string;
    source: EventSource;
    topic?: string | undefined;
    isNewChat?: boolean;
}

export const enum EventSource {
    status = "status_item",
    command = "command_palette",
    activity = "activity_bar",
    info = "info_message",
    slash = "slash_command",
    vslsContacts = "vsls_contacts_panel",
    vslsStarted = "vsls_started"
}

const enum EventType {
    extensionInstalled = "extension_installed",
    viewOpened = "webview_opened",
    messageSent = "message_sent",
    vslsShared = "vsls_shared",
    vslsStarted = "vsls_started",
    vslsEnded = "vsls_ended",
    tokenConfigured = "token_configured",
    channelChanged = "channel_changed",
    authStarted = "auth_started",
    activationStarted = "activation_started",
    activationEnded = "activation_ended"
}

interface EventProperties {
    provider: string | undefined;
    source: EventSource | undefined;
    channel_type: ChannelType | undefined;
}

interface TelemetryEvent {
    type: EventType;
    time: Date;
    properties: EventProperties;
}

interface ChatTreeNode {
    label: string;
    channel: Channel | undefined;
    user: User | undefined;
    team: Team | undefined;
    isCategory: boolean;
    presence: UserPresence;
    providerName: string;
}

export type InitialState = {
    provider: string;
    teamId: string | undefined;
};

const enum ThreadPosition {
    sidebar = "Sidebar",
    panelTab = "Panel Tab"
}

export interface AuthConfig {
    username: string | undefined;
    password?: string | undefined;
    realm: string | undefined;
    apiKey?: string | undefined;
}

export const enum LoginResult {
    success = 'success',
    error = 'error',
}

export interface LoginResponse {
    result: LoginResult;
    errorMessage?: string;
}

export const enum MessageRelyType {
    direct = "direct",
    stream = "stream",
    private = "private"
}

export interface MessageNarrow {
    operator: string;
    operand: any;
    negated?: boolean;
}