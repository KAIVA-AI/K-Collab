export interface IRealm {
  realm_string: string;
}
export interface IChannel {
  stream_id: string;
  realm_string: string;
  name: string;
}
export interface ITopic {
  name: string;
  stream_id: string;
}
export interface IMessage {
  id: number;
  topic_id: string;
  content: string;
  sender_full_name: string;
  sender_email: string;
  timestamp: number;
}
