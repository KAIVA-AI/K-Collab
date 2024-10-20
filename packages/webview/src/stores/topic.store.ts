import { IWebviewMessage, TopicFileInput, ITopic } from '../models';
import { action, makeObservable, observable } from 'mobx';
import { RootStore } from '.';

export class TopicStore {
  @observable topics: ITopic[] = [];
  @observable currentTopic?: ITopic;

  constructor(private rootStore: RootStore) {
    makeObservable(this);
  }

  @action loadData = async () => {
    const channelId = this.rootStore.channelStore.currentChannel?.stream_id;
    if (!channelId) {
      return;
    }
    this.topics = await this.rootStore.zulipService.getTopics(channelId);

    this.currentTopic = this.topics[0];
  };

  @action onMessageFromVSCode = (message: IWebviewMessage) => {
    if (message.command === 'addFileToTopic') {
      const file: TopicFileInput = new TopicFileInput(message.data.file);
      if (file.isFile) {
        const exists = this.currentTopic?.file_inputs?.find(
          f => f.isFile && f.path === file.path,
        );
        if (exists) {
          console.log('file already exists');
          return;
        }
        this.currentTopic?.file_inputs?.push(file);
      }
      if (file.isSelection) {
        const exists = this.currentTopic?.file_inputs?.find(
          f =>
            f.isSelection &&
            f.path === file.path &&
            f.start === file.start &&
            f.end === file.end,
        );
        if (exists) {
          console.log('selection already exists');
          return;
        }
        this.currentTopic?.file_inputs?.push(file);
      }
    }
  };

  @action selectAddContextMethod = async () => {
    this.rootStore.postMessageToVSCode({
      source: 'webview',
      command: 'selectAddContextMethod',
      data: {},
    });
  };

  @action onRemoveFile = (file: TopicFileInput) => {
    const index = this.currentTopic?.file_inputs?.findIndex(
      f =>
        f.path === file.path &&
        f.start === file.start &&
        f.end === file.end &&
        f.isFile === file.isFile,
    );
    if (index !== undefined && index !== -1) {
      this.currentTopic?.file_inputs?.splice(index, 1);
    }
  };
}
