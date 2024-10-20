import { useRootStore } from '@src/stores';
import { Observer } from 'mobx-react';

export const ChatMainComponent = () => {
  const rootStore = useRootStore();
  const messages = rootStore.messageStore.messages;

  return (
    <Observer>
      {() => (
        <div className="main-block">
          {messages.map((message, index) => (
            <div key={index}>{message.content}</div>
          ))}
        </div>
      )}
    </Observer>
  );
};
