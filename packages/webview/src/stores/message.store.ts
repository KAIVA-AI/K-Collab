import { IMessage, IWebviewMessage, IZulipEvent } from '../models';
import { action, makeObservable, observable } from 'mobx';
import { RootStore } from '.';

export class MessageStore {
  @observable messages: IMessage[] = [];

  constructor(private rootStore: RootStore) {
    makeObservable(this);
  }

  @action loadData = async () => {
    const topic = this.rootStore.topicStore.currentTopic;
    if (!topic) {
      return;
    }
    this.messages = await this.rootStore.zulipService.getMessages(
      topic.stream_id,
      topic.name,
    );
  };

  @action onMessageFromVSCode = (message: IWebviewMessage) => {
    if (message.command === 'onZulipEventMessage') {
      const event: IZulipEvent = message.data.event;
      if (event.type === 'message' && event.message) {
        this.messages.push(event.message);
        // TODO scroll to bottom
      }
    }
  };
}
