import { inject, Observer, Provider } from 'mobx-react';
import { ChatInputMentionComponent } from './chat-input-mention';
import React, { Component } from 'react';
import { BaseComponentProps } from 'src/models/base';
import { ChatInputViewModel } from './chat-input.viewmodel';
import { IReactionDisposer, reaction } from 'mobx';

interface IProps extends BaseComponentProps {
  onSendMessage: (inputValue?: string) => Promise<void>;
}

@inject('rootStore')
export class ChatInputComponent extends Component<IProps> {
  private viewModel: ChatInputViewModel;

  constructor(props: IProps) {
    super(props);
    this.viewModel = new ChatInputViewModel(this.rootStore); // Pass rootStore here
  }
  // private viewModel = new ChatInputViewModel();
  private disposers: IReactionDisposer[] = [];

  private get rootStore() {
    return this.props.rootStore!;
  }
  private get chatViewModel() {
    return this.rootStore.chatViewModel;
  }

  componentDidMount(): void {
    this.disposers.push(
      reaction(
        () => this.chatViewModel.eventFocusInput,
        () => {
          if (this.chatViewModel.eventFocusInput) {
            this.viewModel.inputRef.current?.focus();
            this.chatViewModel.eventFocusInput = false;
          }
        },
        { fireImmediately: true },
      ),
      reaction(
        () => this.viewModel.sendingInputValue,
        () => {
          if (this.viewModel.sendingInputValue !== undefined) {
            const inputValue = this.viewModel.sendingInputValue;
            this.viewModel.sendingInputValue = undefined;
            this.props.onSendMessage(inputValue).finally(() => {
              this.viewModel.sending = false;
            });
          }
        },
        { fireImmediately: true },
      ),
    );
  }

  componentWillUnmount() {
    this.disposers.forEach(disposer => {
      disposer();
    });
  }

  onSubmitInput = () => {
    this.viewModel.onSubmitInput();
  };

  render() {
    return (
      <Provider viewModel={this.viewModel}>
        <ChatInputMentionComponent />
        <Observer>
          {() => (
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
          )}
        </Observer>
      </Provider>
    );
  }
}
