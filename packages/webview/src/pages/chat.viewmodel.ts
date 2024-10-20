import { RootStore } from '../stores';
import { action, makeObservable, observable } from 'mobx';
import { ChangeEventHandler } from 'react';

export class ChatViewModel {
  @observable prompt = '';

  constructor(private rootStore: RootStore) {
    makeObservable(this);
  }

  @action onChangePrompt: ChangeEventHandler<HTMLTextAreaElement> = event => {
    this.prompt = event.target.value;
  };

  @action sendMessage = () => {
    this.rootStore.messageStore.messages.push({
      id: 1,
      topic_id: '1',
      content: this.prompt,
      sender_full_name: 'sender1',
      sender_email: '',
      timestamp: Date.now(),
    });
    this.prompt = '';
  };
}
