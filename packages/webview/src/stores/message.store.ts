import { IMessage } from '../models';
import { action, makeObservable, observable } from 'mobx';

export class MessageStore {
  @observable messages: IMessage[] = [];

  constructor() {
    makeObservable(this);
  }

  @action fakeData = () => {
    this.messages = [
      {
        id: 1,
        topic_id: '1',
        content: 'message1',
        sender_full_name: 'sender1',
        sender_email: '',
        timestamp: Date.now(),
      },
      {
        id: 1,
        topic_id: '1',
        content: 'message2',
        sender_full_name: 'sender1',
        sender_email: '',
        timestamp: Date.now(),
      },
      {
        id: 1,
        topic_id: '1',
        content: 'message3',
        sender_full_name: 'sender1',
        sender_email: '',
        timestamp: Date.now(),
      },
      {
        id: 1,
        topic_id: '1',
        content: 'message4',
        sender_full_name: 'sender1',
        sender_email: '',
        timestamp: Date.now(),
      },
    ];
  };
}
