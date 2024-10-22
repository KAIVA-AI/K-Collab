import { Observer } from 'mobx-react';
import { useRootStore } from '../../../stores';
import { ChatInputComponent } from './chat-input';

export const ChatBottomComponent = () => {
  const { chatViewModel, topicStore } = useRootStore();

  return (
    <Observer>
      {() => (
        <div className="bottom-block">
          <div className="context-block">
            <div className="add-context">
              <i
                className="codicon codicon-add"
                onClick={() => topicStore.selectAddContextMethod()}
              />
            </div>
            <div className="context-list">
              {topicStore.currentTopic?.file_inputs?.map((file, index) => (
                <div className="context-file" key={index}>
                  <span>{file.name}</span>
                  {file.isSelection && (
                    <span>
                      :{file.start}-{file.end}
                    </span>
                  )}
                  <i
                    className="remove codicon codicon-close"
                    onClick={() => topicStore.onRemoveFile(file)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="input-block">
            <ChatInputComponent />
          </div>
          <div className="action-block">
            <div className="action-left">
              <div className="action-icon">
                <i className="codicon codicon-mention" />
              </div>
            </div>
            <div className="action-right">
              <div className="action-icon" onClick={chatViewModel.sendMessage}>
                <i className="codicon codicon-send" />
              </div>
            </div>
          </div>
        </div>
      )}
    </Observer>
  );
};
