export interface MessageItemModel {
    id: string;
    contents: string;
    isReply?: boolean;
    isFinished?: boolean;
}

export interface User {
    avatar_url: string
}

export interface IRealm {
    realm: string;
    userName: string;
    apiKey: string;
  }
  
  export interface IStream {
    can_remove_subscribers_group_id: number;
    date_created: number;
    description: string;
    first_message_id: any;
    history_public_to_subscribers: boolean;
    invite_only: boolean;
    is_web_public: boolean;
    message_retention_days: any;
    name: string;
    rendered_description: string;
    stream_id: number;
    stream_post_policy: number;
    is_announcement_only: boolean;
    topics: IListTopic[];
  }
  
  export interface IListTopic {
    name: string;
    max_id: number;
  }
  
  export interface IGetMsgAPIParams {
    anchor: string, // optional by zulip default: "newest" | "oldest" | "first_unread"
    num_before: number;
    num_after: number;
    narrow: any;
    client_gravatar?: boolean;
    apply_markdown?: boolean;
    include_anchor?: boolean;
    language?: string;
  }
  
  export interface IPostMsgAPIParams {
    type: "direct" | "stream" | "private";
    to: string | number | (string)[] | (number)[];
    content: string;
    topic?: string;
    read_by_sender?: boolean;
    language?: string;
  }
  
  export interface IMessage {
    id: number;
    sender_id: number;
    content: string;
    recipient_id: number;
    timestamp: number;
    client: string;
    subject: string;
    topic_links: any[];
    is_me_message: boolean;
    reactions: IReaction[];
    submessages: any[];
    flags: any[];
    sender_full_name: string;
    sender_email: string;
    sender_realm_str: string;
    display_recipient: string | IRecipient[];
    type: string;
    stream_id: number;
    avatar_url: any;
    content_type: string;
    is_evaluated?: boolean;
  }
  
  export interface IReaction {
    emoji_name: string;
    emoji_code: string;
    reaction_type: string;
    user: {
      email: IZulipCurrentUser["email"];
      full_name: IZulipCurrentUser["full_name"];
      id: IZulipCurrentUser["user_id"];
    };
    user_id: IZulipCurrentUser["user_id"];
  }
  
  export interface IGroupedMessage {
    sender_full_name: IMessage["sender_full_name"],
    avatar_url: IMessage["avatar_url"],
    sender_id: IMessage["sender_id"],
    timestamp: IMessage["timestamp"],
    sub_messages: IMessage[];
    childIds: IMessage["id"][];
  }
  
  export interface IDetailZulipMessage {
    message: IMessage;
    msg: string;
    raw_content: string;
    result: string;
  }
  
  export interface IRecipient {
    email: string;
    full_name: string;
    id: number;
    is_mirror_dummy: boolean;
  }
  
  export interface IChatRowData {
    timestamp: number;
    avatar_url: string;
    sender_id: number;
    sender_full_name: string;
    sub_messages: IMessage[];
  }


  export interface IGetMsgAPIParams {
    anchor: string, // optional by zulip default: "newest" | "oldest" | "first_unread"
    num_before: number;
    num_after: number;
    narrow: any;
    client_gravatar?: boolean;
    apply_markdown?: boolean;
    include_anchor?: boolean;
    language?: string;
  }
  
  export interface IZulipUser {
    email: string;
    user_id: number;
    avatar_version: number;
    is_admin: boolean;
    is_owner: boolean;
    is_guest: boolean;
    is_billing_admin: boolean;
    role: number;
    is_bot: boolean;
    full_name: string;
    timezone: string;
    is_active: boolean;
    date_joined: string;
    avatar_url: string;
    delivery_email: any;
    assistant_type: number | null;
    evaluation?: { key: string, message: string; }[];
  }
  
  export interface IZulipCurrentUser extends IZulipUser {
    profile_data: any;
    max_message_id: number;
  }
  
  export interface IZulipDM {
    full_name: string;
    id: number[];
  }
  
  export interface IUnread {
    pms: IPm[];
    streams: IStreamUnread[];
    huddles: IDmHuddle[];
    mentions: any[];
    count: number;
    old_unreads_missing: boolean;
  }
  
  export interface IPm {
    other_user_id: number;
    sender_id: number;
    unread_message_ids: number[];
  }
  
  export interface IStreamUnread {
    stream_id: number;
    topic: string;
    unread_message_ids: number[];
  }
  
  export interface IDmHuddle {
    user_ids_string: string; // joined array of ids: "26,27,28,30"
    unread_message_ids: number[];
  }
  
  export interface IDmUnread {
    id: string;
    unread_message_ids: number[];
  }
  
  export interface IMessageFlagParam {
    messages: number[];
    op: "add" | "remove";
    flag: "read" | "starred" | "mentioned" | "collapsed"; // doc: https://zulip.com/api/update-message-flags#usage-examples
  }
  
  export interface IMessageReactionParam {
    emoji_code: string;
    emoji_name: string;
    reaction_type: "unicode_emoji"; // https://zulip.com/api/add-reaction#parameter-reaction_type
  }
  
  //docs: https://zulip.com/api/subscribe
  export interface IChannelSubscriptionParam {
    subscriptions: {
      name: string;
      description?: string;
    }[];
    principals?: string[] | number[];
    authorization_errors_fatal?: boolean;
    announce?: boolean;
    invite_only?: boolean;
    is_web_public?: boolean;
    is_default_stream?: boolean;
    history_public_to_subscribers?: boolean;
    stream_post_policy?: 1 | 2 | 3 | 4;
    message_retention_days?: "realm_default" | "unlimited" | string | number;
    can_remove_subscribers_group?: number;
  }
  
  // docs: https://zulip.com/api/set-typing-status
  /**
   * @to (optional): Required for the "direct" type. Ignored in the case of "stream" or "channel" type.
   * @stream_id (optional): Required for the "stream" or "channel" type. Ignored in the case of "direct" type.
   * @topic (optional): Required for the "stream" or "channel" type. Ignored in the case of "direct" type.
   */
  export interface ITypingStatusParams {
    op: "start" | "stop";
    type?: "direct" | "stream";
    to?: number[];
    stream_id?: number;
    topic?: string;
  }
  
  // docs: https://zulip.com/api/update-user-topic
  /**
   * @property visibility policy
   *
   * 0 = None. Removes the visibility policy previously set for the topic.
   *
   * 1 = Muted. Mutes the topic in a channel.
   *
   * 2 = Unmuted. Unmutes the topic in a muted channel.
   *
   * 3 = Followed. Follows the topic.
   */
  export interface ITopicPreferences {
    stream_id: IStream["stream_id"];
    topic: string;
    visibility_policy: 0 | 1 | 2 | 3;
  }

  export interface IChatRow {
    data: IChatRowData;
    // isLightMode: boolean;
    mode: "chat" | "bot-panel";
  }
  
  export interface IMessageContent {
    type: "normal" | "local";
    message: any;
    isSelf: boolean;
    isLightMode: boolean;
    senderId: number;
    mode: IChatRow["mode"];
  }
  
  export interface IMainContent {
    id: IMessage["id"] | null;
    content: any;
    translation: IMessage["content"] | null;
    isSelf: boolean;
    isLightMode: boolean;
  }
  
  export interface IAnswerEvaluation {
    messageId: IMessage["id"];
  }
  