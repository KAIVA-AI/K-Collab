import { IWebviewMessage } from 'src/models';

export interface IBaseWebview {
  getExtensionVersion: (message: IWebviewMessage) => void;
  getPageRouter: (message: IWebviewMessage) => void;
}
