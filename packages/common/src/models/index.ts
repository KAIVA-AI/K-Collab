export interface IWebviewMessage {
  source?: string;
  store?: string;
  command: string;
  data: any;
}

export * from './message';
