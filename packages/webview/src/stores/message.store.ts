import { IMessage, IWebviewMessage, IZulipEvent, ITopic } from '../models';
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';
import { RootStore } from '.';

export class MessageStore {
  @observable messages: IMessage[] = [];

  @computed get topicMessages() {
    const topic = this.rootStore.topicStore.currentTopic;
    if (!topic) {
      return [];
    }
    return this.messages.filter(
      m => m.stream_id === topic.stream_id && m.subject === topic.name,
    );
  }

  constructor(private rootStore: RootStore) {
    makeObservable(this);
  }

  @action loadData = async () => {
    const topic = this.rootStore.topicStore.currentTopic;
    if (!topic) {
      return;
    }
    const messages = await this.rootStore.zulipService.getMessages(
      topic.stream_id,
      topic.name,
    );
    runInAction(() => {
      this.messages = messages;
    });
  };

  @action onMessageFromVSCode = (message: IWebviewMessage) => {
    if (message.command === 'onZulipEventMessage') {
      const event: IZulipEvent = message.data.event;
      if (event.type === 'message' && event.message) {
        this.messages.push(event.message);
        // TODO scroll to bottom
      } else if (event.type === 'update_message') {
        // update new subject to current Topic
        const topicChanged: ITopic = {
          stream_id: event.stream_id ?? 0,
          name: event.subject ?? '',
          file_inputs:
            this.rootStore.topicStore.currentTopic?.file_inputs ?? [],
        };
        // update new subject for message list
        this.messages.forEach(message => {
          message.subject = topicChanged.name;
        });
        this.rootStore.topicStore.currentTopic = topicChanged;
      } else if (event.type === 'typing' && event.sender) {
        const userId = event.sender.user_id;
        if (event.op === 'start') {
          if (!this.rootStore.typingUsers.includes(userId)) {
            this.rootStore.typingUsers.push(userId);
          }
        } else if (event.op === 'stop') {
          this.rootStore.typingUsers = this.rootStore.typingUsers.filter(
            id => id !== userId,
          );
        }
      }
    }
  };

  @action cleanup = () => {
    this.messages = [];
  };
}
