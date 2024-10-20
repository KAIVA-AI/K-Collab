import { IMessage } from './message';

export interface IZulipEvent
  extends IZulipEventHeartbeat,
    IZulipEventMessage,
    IZulipEventEditMessage,
    IZulipEventMoveMessage,
    IZulipEventDeleteMessage,
    IZulipEventTyping {
  type: string; // message, update_message, delete_message, typing
  id: 0;
}

interface IZulipEventHeartbeat {
  //
}

interface IZulipEventMessage {
  message?: IMessage;
  flags?: string[]; // read
}

interface IZulipEventEditMessage {
  message_id?: number;
  stream_id?: number;
  content?: string;
  rendered_content?: string;
  edit_timestamp?: number;
  flags?: string[]; // read
}

interface IZulipEventMoveMessage {
  message_id?: number;
  stream_id?: number;
  new_stream_id?: number;
  edit_timestamp?: number;
  orig_subject?: string;
  subject?: string;
  propagate_mode?: string; // change_one, change_all
  message_ids?: number[];
  flags?: string[]; // read
  /**
// change stream, keep subject
{
  "type": "update_message",
  "user_id": 19,
  "edit_timestamp": 1729442403,
  "message_id": 28,
  "rendering_only": false,
  "stream_name": "Draft Issue",
  "stream_id": 21,
  "propagate_mode": "change_one",
  "orig_subject": "same",
  "new_stream_id": 19,
  "message_ids": [
    28
  ],
  "flags": [
    "read"
  ],
  "id": 0
}
// keep stream, change subject
{
  "type": "update_message",
  "user_id": 19,
  "edit_timestamp": 1729442649,
  "message_id": 28,
  "rendering_only": false,
  "stream_name": "Draft Requirement",
  "stream_id": 19,
  "propagate_mode": "change_all",
  "orig_subject": "same",
  "subject": "same1",
  "topic_links": [],
  "message_ids": [
    28
  ],
  "flags": [
    "read"
  ],
  "id": 1
}
// change stream and subject
{
  "type": "update_message",
  "user_id": 19,
  "edit_timestamp": 1729442752,
  "message_id": 28,
  "rendering_only": false,
  "stream_name": "Draft Requirement",
  "stream_id": 19,
  "propagate_mode": "change_all",
  "orig_subject": "same1",
  "new_stream_id": 21,
  "subject": "same2",
  "topic_links": [],
  "message_ids": [
    28
  ],
  "flags": [
    "read"
  ],
  "id": 2
}
*/
}

interface IZulipEventDeleteMessage {
  message_id?: number;
  message_type?: string;
  stream_id?: number;
  topic?: string;
}

interface IZulipEventTyping {
  stream_id?: number;
  topic?: string;
  op?: string; // start, stop
  message_type?: string; // stream
  sender?: {
    user_id: number;
    email: string;
  };
}

export interface IUnread {
  pms: IPm[];
  streams: IStreamUnread[];
  huddles: IDmHuddle[];
  mentions: any[];
  count: number;
  old_unreads_missing: boolean;
}

interface IPm {
  other_user_id: number;
  sender_id: number;
  unread_message_ids: number[];
}

interface IStreamUnread {
  stream_id: number;
  topic: string;
  unread_message_ids: number[];
}

interface IDmHuddle {
  user_ids_string: string; // joined array of ids: "26,27,28,30"
  unread_message_ids: number[];
}
