import { inject, observer } from 'mobx-react';
import { ChatInputComponent } from './chat-input';
import { Component, createRef, RefObject } from 'react';
import { BaseComponentProps } from 'src/models/base';

@inject('rootStore')
@observer
export class ChatBottomComponent extends Component<BaseComponentProps> {
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
  }

  render() {
    return (
      <div className="bottom-block">
        <div className="context-block">
          <div className="add-context">
            <i
              className="codicon codicon-add"
              onClick={() => this.topicStore.selectAddContextMethod()}
            />
          </div>
          <div className="context-list">
            {this.topicStore.currentTopic?.file_inputs?.map((file, index) => (
              <div className="context-file" key={index}>
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
            onSendMessage={this.chatViewModel.onSendMessage}
          />
        </div>
        <div className="action-block">
          <div className="action-left">
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
