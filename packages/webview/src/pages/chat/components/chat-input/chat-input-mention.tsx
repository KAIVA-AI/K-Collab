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
    console.log("status filter ", this.viewModel.filterMention, this.viewModel.filteredMentions.length, this.viewModel.mentionType)

    return (
    <div
        ref={this.viewModel.mentionListRef}
        className={this.mentionListClass}
      >
        {this.viewModel.mentionType === 'image' && (
            <div className="mention-group">
              {this.viewModel.filteredMentions.length > 0 ? (
                this.viewModel.filteredMentions.map(file => (
                  <div
                    key={file.index}
                    className={file.className}
                    onClick={() => {
                      this.viewModel.handleSelectMention(`img:${file.value}`);
                    }}
                  >
                    img:{file.value}
                  </div>
                ))
              ) : (
                <div className="mention-item">No available images</div>
              )}
            </div>
          )}
          {this.viewModel.mentionType === 'item' && (
            <div className="mention-group">
              {this.viewModel.filteredMentions.length > 0 ? (
                this.viewModel.filteredMentions.map(file => (
                  <div
                    key={file.index}
                    className={file.className}
                    onClick={() => {
                      this.viewModel.handleSelectMention(`item:${file.value}`);
                    }}
                  >
                    item:{file.value}
                  </div>
                ))
              ) : (
                <div className="mention-item">No available items</div>
              )}
            </div>
          )}

          {this.viewModel.mentionType === 'command' && (
            <div className="mention-group">
              {this.viewModel.filteredMentions.length > 0 ? (
                this.viewModel.filteredMentions.map(file => (
                  <div
                    key={file.index}
                    className={file.className}
                    onClick={() => {
                      this.viewModel.handleSelectMention(`${file.value}`);
                    }}
                  >
                    {file.value}
                  </div>
                ))
              ) : (
                <div className="mention-item">No available commands</div>
              )}
            </div>
          )}

          {this.viewModel.mentionType === 'attribute' && (
            <div className="mention-group">
              {this.viewModel.filteredMentions.length > 0 ? (
                this.viewModel.filteredMentions.map(attribute => (
                  <div
                    key={attribute.index}
                    className={attribute.className}
                    onClick={() => {
                      this.viewModel.handleSelectMention(`attr:${attribute.value}`);
                    }}
                  >
                    attr:{attribute.value}
                  </div>
                ))
              ) : (
                <div className="mention-item">No available attributes</div>
              )}
            </div>
          )}
      </div>
    );
  }
}
