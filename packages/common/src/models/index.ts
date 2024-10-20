export interface IWebviewMessage {
  source?: string;
  store?: string;
  command: string;
  data: any;
}
export interface ITopicFileInput {
  name: string;
  path: string;
  start?: number;
  end?: number;
}
export class TopicFileInput {
  name: string;
  path: string;
  start?: number;
  end?: number;

  constructor(data: ITopicFileInput) {
    this.name = data.name;
    this.path = data.path;
    this.start = data.start;
    this.end = data.end;
  }

  get isFile(): boolean {
    return this.start === undefined && this.end === undefined;
  }

  get isSelection(): boolean {
    return this.start !== undefined && this.end !== undefined;
  }
}
