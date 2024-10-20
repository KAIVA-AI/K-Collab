import { createContext, useContext } from 'react';
import { RealmStore } from './realm.store';
import { ChannelStore } from './channel.store';
import { MessageStore } from './message.store';
import { TopicStore } from './topic.store';
import { action } from 'mobx';
import { ChatViewModel } from '@src/pages/chat.viewmodel';

export class RootStore {
  realmStore = new RealmStore();
  channelStore = new ChannelStore();
  topicStore = new TopicStore();
  messageStore = new MessageStore();
  chatViewModel: ChatViewModel;

  constructor() {
    this.chatViewModel = new ChatViewModel(this);
    this.fakeData();
  }

  @action fakeData = () => {
    this.realmStore.fakeData();
    this.channelStore.fakeData();
    this.topicStore.fakeData();
    this.messageStore.fakeData();
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
