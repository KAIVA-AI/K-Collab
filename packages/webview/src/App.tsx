import { inject, observer, Provider } from 'mobx-react';
import { Component, lazy } from 'react';
import { BaseComponentProps } from './models/base';
import { LoadingPage } from './pages/bootstrap/loading';
import { VersionPage } from './pages/bootstrap/version';
import { rootStore } from './stores';
import { enableLogging } from 'mobx-logger';

import './assets/scss/app.scss';

const LoginPage = lazy(() => import('./pages/login/login'));
const TopicPage = lazy(() => import('./pages/topic/topic'));
const ChatPage = lazy(() => import('./pages/chat/chat'));

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
    if (!this.rootStore.authStore.isLogin) {
      return <LoginPage />;
    }
    if (this.rootStore.pageRouter === 'chat-panel') {
      return this.topicStore.currentTopic ? <ChatPage /> : <TopicPage />;
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
