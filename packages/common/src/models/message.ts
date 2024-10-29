export interface IChannel {
  stream_id: number;
  name: string;
  description?: string;
  color?: string;
}

export interface ITopicFileInput {
  db_index?: string;
  name: string;
  path: string;
  start?: string;
  end?: string;
  content?: string;
}
export class TopicFileInput {
  readonly db_index?: string;
  readonly name: string;
  readonly path: string;
  readonly start?: string;
  readonly end?: string;
  readonly content?: string;

  constructor(data: ITopicFileInput) {
    this.db_index = data.db_index;
    this.name = data.name;
    this.path = data.path;
    this.start = data.start;
    this.end = data.end;
    this.content = data.content;
  }

  get isFile(): boolean {
    return this.start === undefined && this.end === undefined;
  }

  get isSelection(): boolean {
    return this.start !== undefined && this.end !== undefined;
  }
}

export interface ITopic {
  topic_id?: number;
  stream_id: number;
  name: string;
  max_id?: number;
  file_inputs?: TopicFileInput[];
}
export interface IMessage {
  id: number;
  stream_id: number;
  subject: string;
  content: string;
  sender_full_name: string;
  timestamp: number;
  recipient_id?: number;
  is_me_message?: boolean;
}

export interface IZulipSendMessageParams {
  type?: string;
  to: number;
  topic?: string;
  content: string;
}

export interface ZulipAcceptedFile {
  type: []
}

export interface IZulipUserFileUpload {
  type: string;
  name: string;
  files: FileList;
}
