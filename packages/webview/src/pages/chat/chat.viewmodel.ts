import { IZulipSendMessageParams, TopicFileInput } from '@k-collab/common';
import { RootStore } from '../../stores';
import { action, makeObservable, observable } from 'mobx';

export class ChatViewModel {
  @observable eventFocusInput = false;

  constructor(private rootStore: RootStore) {
    makeObservable(this);
  }

  @action clickPreviewChange = (content: string) => {
    var tempElement = document.createElement('pre');
    tempElement.innerHTML = content;
    const text = tempElement.textContent || tempElement.innerText || '';
    this.rootStore.postMessageToVSCode({
      command: 'previewChange',
      data: {
        content: text,
      },
    });
  };

  @action clickInsertMessage = (content: string) => {
    var tempElement = document.createElement('pre');
    tempElement.innerHTML = content;
    const text = tempElement.textContent || tempElement.innerText || '';
    this.rootStore.postMessageToVSCode({
      command: 'insertMessage',
      data: {
        content: text,
      },
    });
  };

  @action clickCopyMessage = (content: string) => {
    var tempElement = document.createElement('pre');
    tempElement.innerHTML = content;
    const text = tempElement.textContent || tempElement.innerText || '';
    this.rootStore.postMessageToVSCode({
      command: 'copyMessage',
      data: {
        content: text,
      },
    });
  };

  @action onSendMessage = async (inputValue?: string) => {
    if (!inputValue || inputValue.trim() === '') {
      return;
    }
    try {
      // extract values
      const _chatType: 'topic' | 'dm' = 'topic';
      const targetId = this.rootStore.topicStore.currentTopic?.stream_id || 0;
      const subject = this.rootStore.topicStore.currentTopic?.name || '';
      if (_chatType !== 'topic' && _chatType !== 'dm') {
        throw new Error('Invalid chat type');
      }
      let params: IZulipSendMessageParams | undefined = undefined;

      if (_chatType === 'topic') {
        params = {
          type: 'stream',
          to: targetId,
          topic: subject,
          content: inputValue,
        };
      } else if (_chatType === 'dm') {
        params = {
          type: 'direct',
          to: targetId,
          content: inputValue,
        };
      }

      return this.rootStore.zulipService.sendMessage(params!);
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  @action openInputFile = (file: TopicFileInput) => {
    this.rootStore.postMessageToVSCode({
      command: 'openInputFile',
      data: {
        file,
      },
    });
  };
}
