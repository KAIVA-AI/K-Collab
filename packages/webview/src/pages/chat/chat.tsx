import { ChatHeaderComponent } from './components/chat-header';
import { ChatMainComponent } from './components/chat-main';
import { ChatBottomComponent } from './components/chat-bottom';
import { observer } from 'mobx-react';
import { Component } from 'react';

import './chat.scss';

@observer
class ChatPage extends Component {
  render() {
    return (
      <div className="chat-page">
        <ChatHeaderComponent />
        <ChatMainComponent />
        <ChatBottomComponent />
      </div>
    );
  }
}

export default ChatPage;
