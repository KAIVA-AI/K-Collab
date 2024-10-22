import { createContext, useContext } from 'react';
import { RealmStore } from './realm.store';
import { ChannelStore } from './channel.store';
import { MessageStore } from './message.store';
import { TopicStore } from './topic.store';
import { action, makeObservable } from 'mobx';
import { ChatViewModel } from '../pages/chat/chat.viewmodel';
import { IWebviewMessage } from '../models';
import { Constants, ZulipService } from '@v-collab/common';

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

  constructor() {
    makeObservable(this);
    this.zulipService = new ZulipService(Constants.REALM_STRING);
    this.zulipService.setBasicAuth(
      Constants.USER_EMAIL,
      Constants.USER_API_KEY,
    );
  }

  @action init = () => {
    this.registerVSCodeListener();
    this.loadData();
  };

  private registerVSCodeListener = () => {
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
    if (message.store === 'TopicStore') {
      this.topicStore.onMessageFromVSCode(message);
    }
    if (message.store === 'MessageStore') {
      this.messageStore.onMessageFromVSCode(message);
    }
  };

  @action postMessageToVSCode = async (message: IWebviewMessage) => {
    if (!message.source) {
      message.source = 'webview';
    }
    this.vscode.postMessage(message);
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
