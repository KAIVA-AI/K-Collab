import { useRootStore } from '../../../stores';
import { observer } from 'mobx-react';
import { ChatMessageItem } from './chat-message-item';
import { useEffect, useRef } from 'react';

export const ChatMainComponent = observer(() => {
  const { messageStore } = useRootStore();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      const lastMessage = messagesEndRef.current.lastElementChild;
      lastMessage?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messageStore.topicMessages]);

  return (
    <div className="main-block" ref={messagesEndRef}>
      {messageStore.topicMessages.map((message, index) => (
        <ChatMessageItem key={index} message={message} />
      ))}
    </div>
  );
});
