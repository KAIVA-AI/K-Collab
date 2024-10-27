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
    const classes: string[] = ['mention-list'];
    if (!this.viewModel.isShowMentionBox) {
      classes.push('hidden');
    }
    return classes.join(' ');
  }

  render() {
    return (
      <div
        ref={this.viewModel.mentionListRef}
        className={this.mentionListClass}
      >
        <div className="mention-group">
          {this.viewModel.hasSlashCommand ? (
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
        <div className="mention-group">
          {this.viewModel.filteredUserMentions.map((command, index) => (
            <div
              key={index}
              className="mention-item"
              onClick={() => {
                this.viewModel.handleSelectMention(command);
              }}
            >
              /{command}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
