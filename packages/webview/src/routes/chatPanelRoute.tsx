import { inject, observer } from 'mobx-react';
import { Component, lazy } from 'react';
import { BaseComponentProps } from 'src/models/base';

const TopicPage = lazy(() => import('../pages/topic/topic'));
const ChatPage = lazy(() => import('../pages/chat/chat'));
const WorkspacePage = lazy(() => import('../pages/workspace/workspace'));
const Setting = lazy(() => import('../pages/setting/setting'));

@inject('rootStore')
@observer
class ChatPanelRoute extends Component<BaseComponentProps> {
  get rootStore() {
    return this.props.rootStore!;
  }
  get realmStore() {
    return this.rootStore.realmStore;
  }
  get topicStore() {
    return this.rootStore.topicStore;
  }

  renderPage() {
    if (!this.realmStore.currentRealm) {
      return <WorkspacePage />;
    }
    if (!this.topicStore.currentTopic) {
      return <TopicPage />;
    }
    return <ChatPage />;
  }

  render() {
    return <Setting>{this.renderPage()}</Setting>;
  }
}
export default ChatPanelRoute;
