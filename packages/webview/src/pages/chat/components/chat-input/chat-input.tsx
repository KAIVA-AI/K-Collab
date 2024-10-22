import { inject, observer, Provider } from 'mobx-react';
import { ChatInputMentionComponent } from './chat-input-mention';
import { Component, RefObject } from 'react';
import { BaseComponentProps } from 'src/models/base';
import { ChatInputViewModel } from './chat-input.viewmodel';

interface IProps extends BaseComponentProps {
  chatInputRef?: RefObject<ChatInputComponent>;
  onSendMessage: (inputValue?: string) => Promise<void>;
}

@inject('rootStore')
@observer
export class ChatInputComponent extends Component<IProps> {
  private viewModel = new ChatInputViewModel();
  get rootStore() {
    return this.props.rootStore!;
  }
  get chatViewModel() {
    return this.rootStore.chatViewModel;
  }

  componentDidMount(): void {
    if (this.chatViewModel.eventFocusInput) {
      this.viewModel.inputRef.current?.focus();
      this.chatViewModel.eventFocusInput = false;
    }
  }

  componentDidUpdate(): void {
    if (this.viewModel.sendingInputValue !== undefined) {
      const inputValue = this.viewModel.sendingInputValue;
      this.viewModel.sendingInputValue = undefined;
      this.props.onSendMessage(inputValue).finally(() => {
        this.viewModel.sending = false;
      });
    }
    if (this.chatViewModel.eventFocusInput) {
      this.viewModel.inputRef.current?.focus();
      this.chatViewModel.eventFocusInput = false;
    }
  }

  onSubmitInput = () => {
    this.viewModel.onSubmitInput();
  };

  render() {
    return (
      <Provider viewModel={this.viewModel}>
        <ChatInputMentionComponent />
        <textarea
          id="chatbox__input"
          ref={this.viewModel.inputRef}
          value={this.viewModel.prompt}
          placeholder={`Talk about the...`}
          onChange={e => {
            this.viewModel.onChangePrompt(e);
            // handleTyping();
          }}
          onPaste={() => {
            // handlePasteFile
          }}
          onKeyDown={this.viewModel.handleKeyDown}
        />
      </Provider>
    );
  }
}
