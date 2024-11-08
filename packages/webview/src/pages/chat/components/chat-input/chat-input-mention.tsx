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

  render() {
    const showSlashCommands = this.viewModel.currentInput.includes('/');
    const showFileInputs = this.viewModel.currentInput.includes('/img:');
    const showElementHtml = this.viewModel.currentInput.includes('/element:');
    const showAttribute = this.viewModel.currentInput.includes('/attribute:');

    return (
      <div
        ref={this.viewModel.mentionListRef}
        className={this.mentionListClass}
      >
        {showSlashCommands && (
          <div className="mention-group">
            {this.viewModel.filteredSlashCommands.length > 0 ? (
              this.viewModel.filteredSlashCommands.map(command => (
                <div
                  key={command.index}
                  className={command.className}
                  onClick={() => {
                    this.viewModel.handleSelectMention(command.value);
                  }}
                >
                  /{command.value}
                </div>
              ))
            ) : (
              <div className="mention-item">No available command</div>
            )}
          </div>
        )}

        {showFileInputs && (
          <div className="mention-group">
            {this.viewModel.filteredContextImages.length > 0 ? (
              this.viewModel.filteredContextImages.map(file => (
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
              <div className="mention-item">No available files</div>
            )}
          </div>
        )}
        {showElementHtml && (
          <div className="mention-group">
            {this.viewModel.filteredElements.length > 0 ? (
              this.viewModel.filteredElements.map(file => (
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
              <div className="mention-item">No available elements</div>
            )}
          </div>
        )}
        {showAttribute && (
          <div className="mention-group">
            {this.viewModel.filteredSlashAttribute.length > 0 ? (
              this.viewModel.filteredSlashAttribute.map(file => (
                <div
                  key={file.index}
                  className={file.className}
                  onClick={() => {
                    this.viewModel.handleSelectMention(
                      `attribute:${file.value}`,
                    );
                  }}
                >
                  attribute:{file.value}
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
