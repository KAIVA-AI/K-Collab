export interface IWebviewMessage {
  source?: string;
  store?: string;
  command: string;
  data?: any;
  hasReturn?: boolean;
  webviewCallbackKey?: string;
}

export * from './message';
export * from './event';
export * from './workspace';
export * from './chatbox';
