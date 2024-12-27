import { ChatHeaderComponent } from './components/chat-header';
import { ChatMainComponent } from './components/chat-main';
import { ChatBottomComponent } from './components/chat-bottom';
import { inject, observer } from 'mobx-react';
import { Component } from 'react';

import './chat.scss';
import { BaseComponentProps } from 'src/models/base';

@inject('rootStore')
@observer
class ChatPage extends Component<BaseComponentProps> {
  get rootStore() {
    return this.props.rootStore!;
  }
  async componentDidMount(): Promise<void> {
    this.rootStore.setCurrentWebviewPageContext('chat-page');
    this.rootStore.messageStore.loadData();
    console.log(' LOAD MESSAGE ', this.rootStore.messageStore.messages);
  }

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
