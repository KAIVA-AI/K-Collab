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
    const showSlashCommands = this.viewModel.currentInput.startsWith('/');
    const showFileInputs = this.viewModel.currentInput.startsWith('/img:');
    const showElementHtml = this.viewModel.currentInput.startsWith('/element:');

    console.log(
      'comare show mentions ',
      showSlashCommands,
      '12321',
      showFileInputs,
    );

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
                    this.viewModel.handleSelectMention(file.value);
                  }}
                >
                  /item:{file.value}
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
                    this.viewModel.handleSelectMention(file.value);
                  }}
                >
                  /element:{file.value}
                </div>
              ))
            ) : (
              <div className="mention-item">No available elements</div>
            )}
          </div>
        )}
      </div>
    );
  }
}
