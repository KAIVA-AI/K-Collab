import {
  IWebviewMessage,
  TopicFileInput,
  ITopic,
  ITopicFileInput,
} from '../models';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { RootStore } from '.';
import { ZulipService } from '@v-collab/common';

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
    const topics = await this.rootStore.zulipService.getTopics(channelId);
    runInAction(() => {
      this.topics = topics;
    });
  };

  @action onMessageFromVSCode = async (message: IWebviewMessage) => {
    if (message.command === 'addFileToTopic') {
      const file: TopicFileInput = new TopicFileInput(message.data.file);
      return this.addFileToTopic(file);
    }
    if (message.command === 'backToTopicPage') {
      this.currentTopic = undefined;
      return this.loadData();
    }
    if (message.command === 'startNewTopic') {
      const data: {
        topic: string;
        file?: ITopicFileInput;
        content?: string;
      } = message.data;
      this.currentTopic = {
        stream_id: this.rootStore.channelStore.currentChannel?.stream_id ?? 0,
        name: data.topic,
        file_inputs: [],
      };
      this.rootStore.chatViewModel.eventFocusInput = true;
      if (data.file) {
        await this.addFileToTopic(new TopicFileInput(data.file));
      }
      if (data.content) {
        return this.rootStore.zulipService.sendMessage({
          type: 'stream',
          to: this.rootStore.channelStore.currentChannel?.stream_id ?? 0,
          topic: data.topic,
          content: `@**${ZulipService.BOT_CODING}** ${data.content}`,
        });
      }
    }
  };

  private addFileToTopic = async (file: TopicFileInput) => {
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

    if (this.currentTopic?.name) {
      await this.rootStore.zulipService.addFile(
        this.currentTopic?.name,
        file.path,
        file.content ?? '',
      );
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

  @action selectTopic = (topic: ITopic) => {
    this.currentTopic = topic;
    this.rootStore.messageStore.loadData();
  };
}
