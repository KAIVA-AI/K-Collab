import { inject, observer } from 'mobx-react';
import { Component, lazy } from 'react';
import { BaseComponentProps } from './models/base';

const LoadingPage = lazy(() => import('./pages/bootstrap/loading'));
const VersionPage = lazy(() => import('./pages/bootstrap/version'));
const TopicPage = lazy(() => import('./pages/topic/topic'));
const ChatPage = lazy(() => import('./pages/chat/chat'));
const PreviewPage = lazy(() => import('./pages/preview/preview'));

@inject('rootStore')
@observer
class App extends Component<BaseComponentProps> {
  get rootStore() {
    return this.props.rootStore!;
  }
  get topicStore() {
    return this.rootStore.topicStore;
  }

  componentDidMount(): void {
    this.rootStore.init();
  }

  render() {
    if (!this.rootStore.wakedUp) {
      return <LoadingPage />;
    }
    if (this.rootStore.isVersionMismatch) {
      return <VersionPage />;
    }
    if (this.rootStore.pageRouter === 'chat-panel') {
      return <>{this.topicStore.currentTopic ? <ChatPage /> : <TopicPage />}</>;
    }
    if (this.rootStore.pageRouter === 'view-diff') {
      return <PreviewPage />;
    }
    return <></>;
  }
}
export default App;
