import { inject, observer } from 'mobx-react';
import { Component } from 'react';
import { BaseComponentProps } from 'src/models/base';
import { ChatInputViewModel } from './chat-input.viewmodel';

interface IProps extends BaseComponentProps {
  viewModel?: ChatInputViewModel;
}

@inject('rootStore', 'viewModel')
@observer
export class ChatInputMentionComponent extends Component<IProps> {
  get rootStore() {
    return this.props.rootStore!;
  }
  get chatViewModel() {
    return this.rootStore.chatViewModel;
  }
  get viewModel() {
    return this.props.viewModel!;
  }
  get mentionListClass() {
    const classes: string[] = ['mention-list', 'vc-border'];
    if (!this.viewModel.isShowMentionBox) {
      classes.push('hidden');
    }
    return classes.join(' ');
  }

  get mentionPrefix() {
    if (this.viewModel.currentInput.includes('/img:')) return 'img:';
    if (this.viewModel.currentInput.includes('/item:')) return 'item:';
    if (this.viewModel.currentInput.includes('/attr:')) return 'attr:';
    return '';
  }

  render() {
    const showMentions = this.viewModel.currentInput.includes('/');
    const mentionPrefix = this.mentionPrefix;

    return (
      <div
        ref={this.viewModel.mentionListRef}
        className={this.mentionListClass}
      >
        {showMentions && (
          <div className="mention-group">
            {this.viewModel.filteredMentions.length > 0 ? (
              this.viewModel.filteredMentions.map(mention => (
                <div
                  key={mention.index}
                  className={mention.className}
                  onClick={() => {
                    this.viewModel.handleSelectMention(`${mention.value}`);
                  }}
                >
                  {mentionPrefix}
                  {mention.value}
                </div>
              ))
            ) : (
              <div className="mention-item">No available items</div>
            )}
          </div>
        )}
      </div>
    );
  }
}
