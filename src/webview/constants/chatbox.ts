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
    name : string
}

export interface IStream {
    name : string;
    stream_id : number
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