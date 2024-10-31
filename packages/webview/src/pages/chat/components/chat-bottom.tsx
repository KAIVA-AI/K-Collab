import { inject, observer } from 'mobx-react';
import { ChatInputComponent } from './chat-input';
import React, { Component, createRef, RefObject } from 'react';
import { BaseComponentProps } from 'src/models/base';
import { reaction } from 'mobx';
import UserUploadFormWrapper from './chat-input/user-form-wrapper';
import {
  handleSendFile,
  formatMessageContent,
} from '../../../helpers/string.helper';
@inject('rootStore')
@observer
export class ChatBottomComponent extends Component<BaseComponentProps> {
  formComponentRef: any;
  private get rootStore() {
    return this.props.rootStore!;
  }
  private get chatViewModel() {
    return this.rootStore.chatViewModel;
  }
  private get topicStore() {
    return this.rootStore.topicStore;
  }
  private chatInputRef: RefObject<ChatInputComponent>;

  constructor(props: BaseComponentProps) {
    super(props);
    this.chatInputRef = createRef<ChatInputComponent>();
    this.formComponentRef = React.createRef();
  }

  componentDidUpdate() {
    reaction(
      () => this.formComponentRef.current?.file,
      file => {
        console.log('file selected:', file);
        const payload = {
          file: file,
          name: file.name,
          type: file.type,
        };
        this.rootStore.zulipService.postUserUpload(payload);
      },
    );
  }

  handleSendMessage = async (inputValue?: string) => {
    console.log('file select  ', this.formComponentRef.current?.file);

    const uploadContent = this.formComponentRef.current?.file
      ? await handleSendFile(
          this.formComponentRef.current?.file,
          this.rootStore.zulipService.postUserUpload.bind(
            this.rootStore.zulipService.postUserUpload,
          ),
        )
      : undefined;
    if (uploadContent !== 'undefined') {
      const finalMessage = formatMessageContent(
        inputValue,
        uploadContent,
        null,
      );
      console.log('content upload ', uploadContent);
      console.log('value input ', finalMessage);
      await this.chatViewModel.onSendMessage(finalMessage);
      // Clear file after sending
      this.formComponentRef.current.clearFile();
    }
  };

  render() {
    return (
      <div className="bottom-block vc-border">
        <div className="context-block">
          <div className="add-context vc-border">
            <i
              className="codicon codicon-add"
              onClick={() => this.topicStore.selectAddContextMethod()}
            />
          </div>
          <div className="context-list">
            {this.topicStore.currentTopic?.file_inputs?.map((file, index) => (
              <div className="context-file vc-border" key={index}>
                <div
                  className="file c-pointer"
                  onClick={() => this.chatViewModel.openInputFile(file)}
                >
                  <span>{file.name}</span>
                  {file.isSelection && (
                    <span>
                      :{file.start}-{file.end}
                    </span>
                  )}
                </div>
                <i
                  className="remove codicon codicon-close"
                  onClick={() => this.topicStore.onRemoveFile(file)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="input-block">
          <ChatInputComponent
            ref={this.chatInputRef}
            onSendMessage={this.handleSendMessage}
          />
        </div>
        <div className="action-block">
          <div className="action-left">
            <div className="action-icon">
              <UserUploadFormWrapper ref={this.formComponentRef} />
            </div>
            <div className="action-icon">
              <i className="codicon codicon-mention" />
            </div>
          </div>
          <div className="action-right">
            <div
              className="action-icon"
              onClick={() => this.chatInputRef.current?.onSubmitInput()}
            >
              <i className="codicon codicon-send" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
