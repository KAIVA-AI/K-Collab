import { Observer } from 'mobx-react';
import clsx from 'clsx';
import { useRootStore } from '../../stores';

export const ChatInputMentionComponent = () => {
  const { chatViewModel } = useRootStore();

  return (
    <Observer>
      {() => (
        <div
          className={clsx(
            'mention-list',
            !chatViewModel.isShowMentionBox && 'hidden',
          )}
        >
          <div className="mention-group">
            {chatViewModel.hasSlashCommand ? (
              chatViewModel.filteredSlashCommands.map((command, index) => (
                <div
                  key={index}
                  className="mention-item"
                  onClick={() => {
                    chatViewModel.handleSelectMention(command);
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
            {chatViewModel.filteredUserMentions.map((command, index) => (
              <div
                key={index}
                className="mention-item"
                onClick={() => {
                  chatViewModel.handleSelectMention(command);
                }}
              >
                /{command}
              </div>
            ))}
          </div>
        </div>
      )}
    </Observer>
  );
};
