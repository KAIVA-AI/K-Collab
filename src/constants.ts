import { Channel, ChannelType, NotableMark, SettingAndSupportType } from "./types";

export const CONFIG_ROOT = "collab";
export const EXTENSION_ID = "vietis.v-collab";
export const OUTPUT_CHANNEL_NAME = "Team Chat";
export const CONFIG_AUTO_LAUNCH = "collab.autoLaunchLiveShareChat";

// Is there a way to get this url from the vsls extension?
export const LIVE_SHARE_BASE_URL = `insiders.liveshare.vsengsaas.visualstudio.com`;
export const VSLS_EXTENSION_ID = `ms-vsliveshare.vsliveshare`;
export const VSLS_EXTENSION_PACK_ID = `ms-vsliveshare.vsliveshare-pack`;
export const VSLS_SPACES_EXTENSION_ID = `vsls-contrib.spaces`;

export const LiveShareCommands = {
    START: "liveshare.start",
    END: "liveshare.end",
    JOIN: "liveshare.join"
};

export const VSCodeCommands = {
    OPEN: "vscode.open",
    OPEN_SETTINGS: "workbench.action.openSettings"
};

export const SystemCommands = {
    TRIGGER_INLINE_SUGGEST: "editor.action.inlineSuggest.trigger"
}

export const SelfCommands = {
    // Code AI
    COMPLETION_ON_DEMAND: "extension.v-collab.complete-on-demand",
    // Chat
    OPEN_WEBVIEW_CHAT: "extension.chat.openChatPanel",
    SIGN_IN_WITH_EMAIL_PASSWORD: "extension.chat.authenticateWithEmailPassword",
    SIGN_OUT: "extension.chat.signout",
    SIGN_OUT_FROM_URI: "extension.chat.signouturi",
    CHANGE_THREAD_POSITION: "extension.chat.changeThreadPosition",
    BACK_TO_WORKSPACE: "extension.chat.backToWorkspace",
    UPDATE_MESSAGES: "extension.chat.updateMessages",
    SEND_MESSAGE: "extension.chat.sendMessage",
    SEND_TO_WEBVIEW: "extension.chat.sendToWebview",
    PRIVATE_AI_CHAT_CREATE_NEW_TOPIC: "extension.chat.privateAICreateNewChat",
    PRIVATE_AI_CHAT_REFRESH: "extension.chat.privateAIRefresh",
    UPDATE_CURRENT_STATE: "extension.chat.updateCurrentState",
    SETTING: "extension.chat.setting",
    CLOSE_SETTING: "extension.support.closeSetting",
    // Older commands
    CHANGE_WORKSPACE: "extension.chat.changeWorkspace",
    CHANGE_CHANNEL: "extension.chat.changeChannel",
    SIGN_IN: "extension.chat.authenticate",
    LIVE_SHARE_FROM_MENU: "extension.chat.startLiveShare",
    LIVE_SHARE_SLASH: "extension.chat.slashLiveShare",
    LIVE_SHARE_SESSION_CHANGED: "extension.chat.vslsSessionChanged",
    RESET_STORE: "extension.chat.reset",
    SETUP_NEW_PROVIDER: "extension.chat.setupNewProvider",
    FETCH_REPLIES: "extension.chat.fetchReplies",
    CLEAR_MESSAGES: "extension.chat.clearMessages",
    UPDATE_MESSAGE_REPLIES: "extension.chat.updateReplies",
    UPDATE_PRESENCE_STATUSES: "extension.chat.updatePresenceStatuses",
    UPDATE_SELF_PRESENCE: "extension.chat.updateSelfPresence",
    UPDATE_SELF_PRESENCE_VIA_VSLS: "extension.chat.updateSelfPresenceVsls",
    ADD_MESSAGE_REACTION: "extension.chat.addMessageReaction",
    REMOVE_MESSAGE_REACTION: "extension.chat.removeMessageReaction",
    SEND_THREAD_REPLY: "extension.chat.sendThreadReply",
    SEND_TYPING: "extension.chat.sendTypingMessage",
    SHOW_TYPING: "extension.chat.showTypingMessage",
    INVITE_LIVE_SHARE_CONTACT: "extension.chat.inviteLiveShareContact",
    CHANNEL_MARKED: "extension.chat.updateChannelMark",
    HANDLE_INCOMING_LINKS: "extension.chat.handleIncomingLinks",
    CHAT_WITH_VSLS_SPACE: "extension.chat.chatWithSpace",
    VSLS_SPACE_JOINED: "extension.chat.vslsSpaceJoined",
};

export const WORKSPACE_ITEM_CHANNELS: Channel[] = [
    {
        id: 'group-item-1',
        name: 'Inbox',
        type: ChannelType.group,
        notableMark: NotableMark.inbox
    },
    {
        id: 'group-item-2',
        name: 'Recent conversations',
        type: ChannelType.group,
        notableMark: NotableMark.recent
    },
    {
        id: 'group-item-3',
        name: 'All messages',
        type: ChannelType.group,
        notableMark: NotableMark.allMessage
    },
    {
        id: 'group-item-4',
        name: 'Mentions',
        type: ChannelType.group,
        notableMark: NotableMark.mentions
    },
    {
        id: 'group-item-5',
        name: 'Starred messages',
        type: ChannelType.group,
        notableMark: NotableMark.starred
    },
    {
        id: 'group6',
        name: 'Drafts',
        type: ChannelType.group,
        notableMark: NotableMark.drafts
    }
]; 

export const SETTING_AND_SUPPORT_CHANNEL: Channel[] = [
    {
        id: 'support-item-1',
        name: 'Usage',
        type: ChannelType.support,
        settingAndSupportType: SettingAndSupportType.usage
    },
    {
        id: 'support-item-2',
        name: 'Settings',
        type: ChannelType.support,
        settingAndSupportType: SettingAndSupportType.settings
    },
    {
        id: 'support-item-3',
        name: 'Keyboard Shortcuts',
        type: ChannelType.support,
        settingAndSupportType: SettingAndSupportType.keyboardShortcuts
    },
    {
        id: 'support-item-4',
        name: 'Logout',
        type: ChannelType.support,
        settingAndSupportType: SettingAndSupportType.logout
    },
]; 

export const SLASH_COMMANDS: any = {
    live: {
        share: {
            action: LiveShareCommands.START,
            options: { suppressNotification: true }
        },
        end: { action: LiveShareCommands.END, options: {} }
    }
};

// Reverse commands are acted on when received from Slack
export const REVERSE_SLASH_COMMANDS = {
    live: {
        request: {}
    }
};

// Internal uri schemes
export const TRAVIS_BASE_URL = `travis-ci.org`;
export const TRAVIS_SCHEME = "chat-travis-ci";

// Slack App
const REDIRECT_URI = `https://us-central1-eco-theater-119616.cloudfunctions.net/slackRedirect`
const SLACK_OAUTH_BASE = `https://slack.com/oauth/authorize?scope=client&client_id=282186700213.419156835749`;
export const SLACK_OAUTH = `${SLACK_OAUTH_BASE}&redirect_uri=${REDIRECT_URI}`
export const ZULIP_OAUTH = `${SLACK_OAUTH_BASE}&redirect_uri=${REDIRECT_URI}`

// Discord
const DISCORD_SCOPES = ["identify", "rpc.api", "messages.read", "guilds"];
const DISCORD_SCOPE_STRING = DISCORD_SCOPES.join("%20");
const DISCORD_CLIENT_ID = "486416707951394817";
export const DISCORD_OAUTH = `https://discordapp.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&scope=${DISCORD_SCOPE_STRING}`;

// Zulip
export const ROOT_ZULIP_REALM = "collab.vietis.com.vn:9991";
export const NOTIFICATION_BOT_NAME = "Notification Bot";
export const PRIVATE_AI_CHAT_STREAM = "Private AI Chat";
export const PRIVATE_AI_BOT_TAG_NAME = "@**VietIS-AI**";
export const COMTOR_BOT_TAG_NAME = "@**VietIS-Comtor**";
// TODO: Change this to the actual default bot image on chat server
export const DEFAULT_BOT_IMAGE = "https://secure.gravatar.com/avatar/0fc5476bdf03fe8640cc8fbc27a47549?d=identicon&version=1&s=50";
export const ICON_STREAM_TYPE_PUBLIC = "https://svgshare.com/i/10wk.svg";
export const ICON_STREAM_TYPE_PRIVATE = "https://svgshare.com/i/10wQ.svg";
export const ICON_TOPIC = "https://svgshare.com/i/10yb.svg";
export const LANGUAGE_COMTOR_SETTING = ["english", "vietnamese", "japanese"];
