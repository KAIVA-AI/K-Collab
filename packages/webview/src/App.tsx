import { inject, observer, Provider } from 'mobx-react';
import { Component, lazy } from 'react';
import { BaseComponentProps } from './models/base';
import { LoadingPage } from './pages/bootstrap/loading';
import { VersionPage } from './pages/bootstrap/version';
import { rootStore } from './stores';
import { enableLogging } from 'mobx-logger';

const TopicPage = lazy(() => import('./pages/topic/topic'));
const ChatPage = lazy(() => import('./pages/chat/chat'));
const PreviewPage = lazy(() => import('./pages/preview/preview'));

enableLogging();

@inject('rootStore')
@observer
export class App extends Component<BaseComponentProps> {
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
      return this.topicStore.currentTopic ? <ChatPage /> : <TopicPage />;
    }
    if (this.rootStore.pageRouter === 'view-diff') {
      return <PreviewPage />;
    }
    return <></>;
  }
}
function AppProvided() {
  return (
    <Provider rootStore={rootStore}>
      <App />
    </Provider>
  );
}

export default AppProvided;
