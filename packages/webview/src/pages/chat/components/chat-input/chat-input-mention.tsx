import { inject, observer } from 'mobx-react';
import clsx from 'clsx';
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

  render() {
    return (
      <div
        ref={this.viewModel.mentionListRef}
        className={clsx(
          'mention-list',
          !this.viewModel.isShowMentionBox && 'hidden',
        )}
      >
        <div className="mention-group">
          {this.viewModel.hasSlashCommand ? (
            this.viewModel.filteredSlashCommands.map((command, index) => (
              <div
                key={index}
                className={clsx(
                  'mention-item',
                  index === this.viewModel.mentionIndex && 'selected',
                )}
                onClick={() => {
                  this.viewModel.handleSelectMention(command);
                }}
              >
                /{command}
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
