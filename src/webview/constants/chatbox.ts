import { Hash, User } from "lucide-react";

export const PROJECT_ZULIP_SERVER_MAP = "PROJECT_ZULIP_SERVER_MAP";
export const PROJECT_ZULIP_SERVER_CURRENT = "PROJECT_ZULIP_SERVER_CURRENT";

export interface IMessage {
    id : string

}

export interface IMessageFlagParam {
    messages: [IMessage];
    flag: string;
    op: string
}

export interface IListTopic {
    name : string;
    timestamp: string;
    max_id: number
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
  

export interface IStream {
    name : string;
    stream_id : string
}

export interface IChannelSubscriptionParam {
    subscriptions: [IStream];
    principals: Array<[]> ;
    history_public_to_subscribers: boolean;
    stream_post_policy: number;
    message_retention_days: string;
    announce: boolean
}

export interface ITopicPreferences {
    type: string;
    op: string;
    to: number;
    stream_id: IStream['stream_id'];
    topic: string
}

export interface ITypingStatusParams {
    type: string;
    op: string;
    to: Array<number>;
    stream_id: IStream['stream_id'];
    topic: string
}

export interface IZulipDM {
    full_name: string;
    id: number[];
  }  

export interface UserLogin {
    username: string;
    password: string
}