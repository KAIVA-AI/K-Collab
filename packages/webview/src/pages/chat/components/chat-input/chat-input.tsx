import { inject, Observer, Provider } from 'mobx-react';
import { ChatInputMentionComponent } from './chat-input-mention';
import React, { Component } from 'react';
import { BaseComponentProps } from 'src/models/base';
import { ChatInputViewModel } from './chat-input.viewmodel';
import { IReactionDisposer, reaction } from 'mobx';

interface IProps extends BaseComponentProps {
  onSendMessage: (inputValue?: string) => Promise<void>;
}

/**
 * @description Interval to send "user is typing" notifications (in milliseconds)
 */
export const TYPING_INTERVAL = 7500;

/**
 * @description Delay to consider the user has stopped typing (in milliseconds)
 */
export const STOP_TYPING_DELAY = 2000;

@inject('rootStore')
export class ChatInputComponent extends Component<IProps> {
  private viewModel: ChatInputViewModel;
  private typingTimeoutRef: NodeJS.Timeout | null = null;
  private typingIntervalRef: NodeJS.Timeout | null = null;

  constructor(props: IProps) {
    super(props);
    this.state = {
      isTyping: false,
    };
    this.viewModel = new ChatInputViewModel(this.rootStore); // Pass rootStore here
  }
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

  sendTypingNotification = async (typing: boolean) => {
    try {
      await this.viewModel.setTyping(typing ? 'start' : 'stop');
    } catch (error) {
      console.error('Error sending typing notification', error);
    }
  };

  handleTyping = () => {
    const { isTyping } = this.state as { isTyping: boolean };

    if (!isTyping) {
      this.setState({ isTyping: true });
      this.sendTypingNotification(true);

      this.typingIntervalRef = setInterval(() => {
        this.sendTypingNotification(true);
      }, TYPING_INTERVAL);
    }

    if (this.typingTimeoutRef) {
      clearTimeout(this.typingTimeoutRef);
    }

    this.typingTimeoutRef = setTimeout(() => {
      this.setState({ isTyping: false });
      if (this.typingIntervalRef) {
        clearInterval(this.typingIntervalRef);
      }
      this.sendTypingNotification(false);
    }, STOP_TYPING_DELAY);
  };

  componentWillUnmount() {
    this.disposers.forEach(disposer => {
      disposer();
    });
    if (this.typingTimeoutRef) clearTimeout(this.typingTimeoutRef);
    if (this.typingIntervalRef) clearInterval(this.typingIntervalRef);
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
                // this.handleTyping();
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
