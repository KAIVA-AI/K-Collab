import { useRootStore } from '../../stores';
import { Observer } from 'mobx-react';

export const ChatMainComponent = () => {
  const { messageStore, chatViewModel } = useRootStore();
  const messages = messageStore.messages;

  return (
    <Observer>
      {() => (
        <div className="main-block">
          {messages.map((message, index) => (
            <div key={index} className="message-item">
              <div className="message-author">
                <img
                  className="avatar"
                  src="https://secure.gravatar.com/avatar/0a18525a190d4049400ec0d7fdfa0332?d=identicon&s=50"
                  alt="avatar"
                />
                <div>{message.sender_full_name}</div>
              </div>
              <div className="message-content">
                <div className="message-code-action">
                  <i
                    className="c-pointer codicon codicon-insert"
                    onClick={() =>
                      chatViewModel.clickInsertMessage(message.content)
                    }
                  />
                  <i
                    className="c-pointer codicon codicon-copy"
                    onClick={() =>
                      chatViewModel.clickCopyMessage(message.content)
                    }
                  />
                </div>
                <pre>{message.content}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </Observer>
  );
};
