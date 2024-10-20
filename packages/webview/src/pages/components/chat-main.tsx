import { useRootStore } from '../../stores';
import { Observer } from 'mobx-react';
import { ChatMessageItem } from './chat-message-item';

export const ChatMainComponent = () => {
  const { messageStore } = useRootStore();
  const messages = messageStore.messages;

  return (
    <Observer>
      {() => (
        <div className="main-block">
          {messages.map((message, index) => (
            <ChatMessageItem key={index} message={message} />
          ))}
        </div>
      )}
    </Observer>
  );
};
