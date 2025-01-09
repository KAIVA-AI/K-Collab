import {
  IWebviewMessage,
  TopicFileInput,
  ITopic,
  ITopicFileInput,
} from '../models';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { RootStore } from '.';
import { Constants } from '@v-collab/common';

export class TopicStore {
  @observable topics: ITopic[] = [];
  @observable currentTopic?: ITopic;
  @observable aiModel?: string;

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

    const aiModel = await this.rootStore.zulipService.getAiModel(
      this.rootStore.realmStore.currentRealm?.realm_string!,
      this.rootStore.currentUser?.email!,
    );
    runInAction(() => {
      this.aiModel = aiModel;
    });

    const lastTopic = await this.rootStore.postMessageToVSCode({
      command: 'getLastTopic',
      hasReturn: true,
    });
    if (lastTopic?.data?.topic) {
      const topic = topics.find(t => t.name === lastTopic.data.topic);
      if (topic) {
        this.selectTopic(topic);
      }
    }
  };

  @action onMessageFromVSCode = async (message: IWebviewMessage) => {
    if (message.command === 'addFileToTopic') {
      const file: TopicFileInput = new TopicFileInput(message.data.file);
      // add create new topic when add selection chat
      if (this.currentTopic === undefined) {
        const topic_name = `${file.name}-${new Date().getTime()}`;
        this.rootStore.zulipService.sendMessage({
          type: 'stream',
          to: this.rootStore.channelStore.currentChannel?.stream_id ?? 0,
          topic: topic_name,
          content: `@**${Constants.BOT_CODING}** Let's analyze this selected code below \n ##${file.content}`,
        });
        this.currentTopic = {
          stream_id: this.rootStore.channelStore.currentChannel?.stream_id ?? 0,
          name: topic_name,
          file_inputs: [],
        };
        this.rootStore.postMessageToVSCode({
          command: 'setLastTopic',
          data: {
            realm: this.rootStore.realmStore.currentRealm?.realm_string,
            topic: this.currentTopic?.name,
          },
        });
      }
      this.rootStore.chatViewModel.eventFocusInput = true;
      return this.addFileToTopic(file);
    }
    if (message.command === 'addImageToTopic') {
      const file: TopicFileInput = new TopicFileInput(message.data.file);
      this.rootStore.chatViewModel.eventFocusInput = true;
      return this.addImageToTopic(file);
    }
    if (message.command === 'backToTopicPage') {
      this.currentTopic = undefined;
      // TODO set to common
      this.rootStore.postMessageToVSCode({
        command: 'setLastTopic',
        data: {
          realm: this.rootStore.realmStore.currentRealm?.realm_string,
        },
      });
      return;
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
      this.rootStore.postMessageToVSCode({
        command: 'setLastTopic',
        data: {
          realm: this.rootStore.realmStore.currentRealm?.realm_string,
          topic: this.currentTopic?.name,
        },
      });
      this.rootStore.chatViewModel.eventFocusInput = true;
      if (data.file) {
        await this.addFileToTopic(new TopicFileInput(data.file));
      }
      if (data.content) {
        return this.rootStore.zulipService.sendMessage({
          type: 'stream',
          to: this.rootStore.channelStore.currentChannel?.stream_id ?? 0,
          topic: data.topic,
          content: `@**${Constants.BOT_CODING}** ${data.content}`,
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
        this.rootStore.postMessageToVSCode({
          command: 'raiseMessageToVscodeWindow',
          data: {
            message: `File ${file.name} already exists`,
          },
        });
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
        this.rootStore.postMessageToVSCode({
          command: 'raiseMessageToVscodeWindow',
          data: {
            message: `Selection ${file.name} already exists`,
          },
        });
        return;
      }
      this.currentTopic?.file_inputs?.push(file);
    }

    if (this.currentTopic?.name) {
      await this.rootStore.zulipService
        .addFile(
          this.currentTopic?.name,
          file.name,
          file.path,
          file.start,
          file.end,
          file.content ?? '',
          this.aiModel,
        )
        .then(res => {
          if (res.result === 'error') {
            this.rootStore.postMessageToVSCode({
              command: 'raiseMessageToVscodeWindow',
              data: {
                message: `${res.msg}`,
              },
            });
            return;
          }
        })
        .catch(error => {
          console.error('Đã xảy ra lỗi khi thêm file:', error);
        });
    }
  };

  @action addImageToTopic = async (file: TopicFileInput) => {
    const exists = this.currentTopic?.file_inputs?.find(
      f => f.isFile && f.path === file.path,
    );
    if (exists) {
      this.rootStore.postMessageToVSCode({
        command: 'raiseMessageToVscodeWindow',
        data: {
          message: `Image ${file.name} already exists`,
        },
      });
      return;
    }
    this.currentTopic?.file_inputs?.push(file);

    if (this.currentTopic?.name) {
      await this.rootStore.zulipService.addFile(
        this.currentTopic?.name,
        file.name,
        file.path,
        undefined,
        undefined,
        undefined,
        'coding_context_image',
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
    // TODO remove from api
  };

  @action selectTopic = (topic: ITopic) => {
    this.currentTopic = topic;
    this.rootStore.postMessageToVSCode({
      command: 'setLastTopic',
      data: {
        realm: this.rootStore.realmStore.currentRealm?.realm_string,
        topic: this.currentTopic?.name,
      },
    });
    this.rootStore.chatViewModel.eventFocusInput = true;
    this.rootStore.zulipService.getFileInput(topic.name).then(fileInputs => {
      runInAction(() => {
        if (!this.currentTopic) {
          return;
        }
        this.currentTopic.file_inputs = fileInputs;
      });
    });
    this.rootStore.zulipService.getElementInput(topic.name).then(fileInputs => {
      runInAction(() => {
        if (!this.currentTopic) {
          return;
        }
        this.currentTopic.element_inputs = fileInputs;
      });
    });
  };

  @action EditTopic = (topic: ITopic, message_id: number) => {
    this.rootStore.chatViewModel.eventFocusInput = true;
    this.rootStore.zulipService.editTopic(topic, message_id).then(res => {
      if (res['result'] === 'success') {
        this.currentTopic = topic;
        this.rootStore.messageStore.loadData();
      }
    });
  };

  @action cleanup = () => {
    this.topics = [];
    this.currentTopic = undefined;
  };
}
