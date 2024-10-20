import { createContext, useContext } from 'react';
import { RealmStore } from './realm.store';
import { ChannelStore } from './channel.store';
import { MessageStore } from './message.store';
import { TopicStore } from './topic.store';
import { action } from 'mobx';
import { ChatViewModel } from '../pages/chat.viewmodel';
import { IWebviewMessage } from '@v-collab/common';

declare function acquireVsCodeApi(): {
  postMessage: (message: any) => void;
  getState: () => any;
  setState: (state: any) => void;
};

export class RootStore {
  private vscode = acquireVsCodeApi();
  realmStore = new RealmStore();
  channelStore = new ChannelStore();
  topicStore = new TopicStore(this);
  messageStore = new MessageStore();
  chatViewModel = new ChatViewModel(this);

  constructor() {
    this.registerVSCodeListener();
    this.fakeData();
  }

  registerVSCodeListener = () => {
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

  @action onMessageFromVSCode = (message: IWebviewMessage) => {
    if (message.store === 'TopicStore') {
      this.topicStore.onMessageFromVSCode(message);
    }
  };

  @action fakeData = () => {
    this.realmStore.fakeData();
    this.channelStore.fakeData();
    this.topicStore.fakeData();
    this.messageStore.fakeData();
  };

  @action postMessageToVSCode = async (message: IWebviewMessage) => {
    this.vscode.postMessage(message);
  };
}

const rootStore = new RootStore();
const rootStoreContext = createContext(rootStore);
export const useRootStore = () => {
  const store = useContext(rootStoreContext);
  if (!store) {
    throw new Error('useRootStore must be used within a Provider');
  }
  return store;
};
export { RealmStore, ChannelStore, TopicStore, MessageStore };
