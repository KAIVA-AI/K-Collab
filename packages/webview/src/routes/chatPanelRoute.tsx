import { inject, observer } from 'mobx-react';
import { Component, lazy } from 'react';
import { BaseComponentProps } from 'src/models/base';

const TopicPage = lazy(() => import('../pages/topic/topic'));
const ChatPage = lazy(() => import('../pages/chat/chat'));

@inject('rootStore')
@observer
class ChatPanelRoute extends Component<BaseComponentProps> {
  get rootStore() {
    return this.props.rootStore!;
  }
  get topicStore() {
    return this.rootStore.topicStore;
  }

  componentDidMount(): void {
    this.rootStore.loadData();
  }

  render() {
    return this.topicStore.currentTopic ? <ChatPage /> : <TopicPage />;
  }
}
export default ChatPanelRoute;
