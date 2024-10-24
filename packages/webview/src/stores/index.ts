import { createContext, useContext } from 'react';
import { RealmStore } from './realm.store';
import { ChannelStore } from './channel.store';
import { MessageStore } from './message.store';
import { TopicStore } from './topic.store';
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';
import { ChatViewModel } from '../pages/chat/chat.viewmodel';
import { IWebviewMessage } from '../models';
import { Constants, ZulipService } from '@v-collab/common';
import { v4 as uuidV4 } from 'uuid';

declare function acquireVsCodeApi(): {
  postMessage: (message: any) => void;
  getState: () => any;
  setState: (state: any) => void;
};

const getVSCodeApi = () => {
  if (typeof acquireVsCodeApi === 'undefined') {
    return {
      postMessage: () => {},
      getState: () => {},
      setState: () => {},
    };
  }
  return acquireVsCodeApi();
};

export class RootStore {
  private vscode = getVSCodeApi();
  realmStore = new RealmStore();
  channelStore = new ChannelStore(this);
  topicStore = new TopicStore(this);
  messageStore = new MessageStore(this);
  chatViewModel = new ChatViewModel(this);

  zulipService: ZulipService;

  @observable webviewVersion = '1.0.0';
  @observable extensionVersion = '';
  @observable wakedUp = false;
  @observable pageRouter = 'chat-panel';

  @computed get isVersionMismatch() {
    return this.webviewVersion !== this.extensionVersion;
  }
  @computed get linkToDownload() {
    return `${Constants.WEB_URL}/vscode/v-collab-${this.webviewVersion}.vsix`;
  }

  constructor() {
    makeObservable(this);
    this.zulipService = new ZulipService(Constants.REALM_STRING);
    this.zulipService.setBasicAuth(
      Constants.USER_EMAIL,
      Constants.USER_API_KEY,
    );
  }

  @action init = async () => {
    await this.registerVSCodeListener();
    await this.checkExtensionVersion();
    await this.getPageRouter();
    runInAction(() => {
      this.wakedUp = true;
    });
    this.loadData();
  };

  @action private checkExtensionVersion = async () => {
    this.webviewVersion = Constants.WEB_VERSION;
    const extensionVersion = await this.postMessageToVSCode({
      command: 'getExtensionVersion',
      hasReturn: true,
    });
    extensionVersion &&
      runInAction(() => {
        this.extensionVersion = extensionVersion.data.version;
      });
  };

  @action private getPageRouter = async () => {
    const pageRouter = await this.postMessageToVSCode({
      command: 'getPageRouter',
      hasReturn: true,
    });
    pageRouter &&
      runInAction(() => {
        this.pageRouter = pageRouter.data.pageRouter;
      });
  };

  private registerVSCodeListener = async () => {
    if (!(window as any).isRegistered) {
      window.addEventListener('message', event => {
        const message: IWebviewMessage = event?.data as IWebviewMessage;
        if (message?.source !== 'vscode') {
          return;
        }
        this.onMessageFromVSCode(message);
      });
      (window as any).isRegistered = true;
    }
  };

  private loadData = async () => {
    await this.realmStore.loadData();
    await this.channelStore.loadData();
    await this.topicStore.loadData();
    await this.messageStore.loadData();
  };

  @action onMessageFromVSCode = (message: IWebviewMessage) => {
    if (message.webviewCallbackKey) {
      (window as any)[message.webviewCallbackKey](message);
      return;
    }
    if (message.store === 'TopicStore') {
      this.topicStore.onMessageFromVSCode(message);
    }
    if (message.store === 'MessageStore') {
      this.messageStore.onMessageFromVSCode(message);
    }
  };

  @action postMessageToVSCode = async (
    message: IWebviewMessage,
  ): Promise<IWebviewMessage | undefined> => {
    if (!message.source) {
      message.source = 'webview';
    }
    if (!message.hasReturn) {
      this.vscode.postMessage(message);
      return;
    }
    let completed = false;
    return new Promise(resolve => {
      const id = uuidV4().split('-').join('');
      message.webviewCallbackKey = `webviewCallback${id}`;
      (window as any)[message.webviewCallbackKey] = (
        event: IWebviewMessage,
      ) => {
        completed = true;
        resolve(event);
      };
      this.vscode.postMessage(message);
      setTimeout(() => {
        if (!completed) resolve(undefined);
      }, 1000);
    });
  };
}

export const rootStore = new RootStore();
const rootStoreContext = createContext(rootStore);
export const useRootStore = () => {
  const store = useContext(rootStoreContext);
  if (!store) {
    throw new Error('useRootStore must be used within a Provider');
  }
  return store;
};
export { RealmStore, ChannelStore, TopicStore, MessageStore };
