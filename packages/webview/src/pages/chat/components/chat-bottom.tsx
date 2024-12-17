import { inject, observer } from 'mobx-react';
import { ChatInputComponent } from './chat-input';
import React, { Component, createRef, RefObject } from 'react';
import { BaseComponentProps } from 'src/models/base';
import { reaction, IReactionDisposer, observable, runInAction } from 'mobx';
import UserUploadFormWrapper from './chat-input/user-form-wrapper';
import {
  handleSendFile,
  formatMessageContent,
} from '../../../helpers/string.helper';

@inject('rootStore')
@observer
export class ChatBottomComponent extends Component<BaseComponentProps> {
  @observable isTyping = false; // Local observable to track typing state

  private disposers: (() => void)[] = []; // Array to hold disposers for cleanup

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
  private get messageStore() {
    return this.rootStore.messageStore;
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
        const payload = {
          file: file,
          name: file.name,
          type: file.type,
        };
        this.rootStore.zulipService.postUserUpload(payload);
      },
    );
  }

  componentDidMount() {
    const messageStore = this.messageStore;
    // Create a reaction to track `messageStore.isTyping` and update `isTyping`
    if (messageStore) {
      const isTypingDisposer = reaction(
        () => messageStore.isTyping,
        isTyping => {
          runInAction(() => {
            this.isTyping = isTyping ?? false; // Default to false if undefined
          });
        },
        { fireImmediately: true }, // Ensures this effect runs on initialization
      );
      // Add disposer to the list
      this.disposers.push(isTypingDisposer);
    }
  }

  componentWillUnmount() {
    // Clean up all reactions
    this.disposers.forEach(dispose => dispose());
  }

  handleSendMessage = async (inputValue?: string) => {
    const uploadContent = this.formComponentRef.current?.file
      ? await handleSendFile(
          this.formComponentRef.current?.file,
          this.rootStore.zulipService.postUserUpload.bind(
            this.rootStore.zulipService.postUserUpload,
          ),
        )
      : undefined;
    if (uploadContent !== undefined) {
      await this.rootStore.zulipService.addFile(
        this.rootStore.topicStore.currentTopic?.name
          ? this.rootStore.topicStore.currentTopic?.name
          : '',
        this.formComponentRef.current?.file[0].name,
        this.formComponentRef.current?.file[0].path,
        undefined,
        undefined,
        undefined,
        'coding_context_file',
      );
      const finalMessage = formatMessageContent(
        inputValue,
        uploadContent,
        null,
      );
      await this.chatViewModel.onSendMessage(finalMessage);
      // Clear file after sending
      this.formComponentRef.current.clearFile();
    }
    await this.chatViewModel.onSendMessage(inputValue);
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
              className={`action-icon ${
                this.messageStore.isTyping ? 'disabled' : ''
              }`} // Optionally add a disabled class for styling
              onClick={() => {
                if (!this.messageStore.isTyping) {
                  this.chatInputRef.current?.onSubmitInput();
                } else {
                  this.rootStore.postMessageToVSCode({
                    command: 'raiseMessageToVscodeWindow',
                    data: {
                      message:
                        "Cannot send a message while waiting agent's response",
                    },
                  });
                }
              }}
            >
              <i
                className={`codicon ${
                  this.messageStore.isTyping
                    ? 'codicon-debug-stop'
                    : 'codicon-send'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
