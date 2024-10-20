import './chat.scss';
import { ChatHeaderComponent } from './components/chat-header';
import { ChatMainComponent } from './components/chat-main';
import { ChatBottomComponent } from './components/chat-bottom';
import { Observer } from 'mobx-react';

export const ChatPage = () => {
  return (
    <Observer>
      {() => (
        <div className="chat-page">
          <ChatHeaderComponent />
          <ChatMainComponent />
          <ChatBottomComponent />
        </div>
      )}
    </Observer>
  );
};
