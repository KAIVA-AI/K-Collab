import { inject, observer, Provider } from 'mobx-react';
import { Component, lazy } from 'react';
import { BaseComponentProps } from './models/base';
import { LoadingPage } from './pages/bootstrap/loading';
import { VersionPage } from './pages/bootstrap/version';
import { rootStore } from './stores';
import { enableLogging } from 'mobx-logger';

import './assets/scss/app.scss';
import '@vscode/codicons/dist/codicon.css';
const LoginPage = lazy(() => import('./pages/login/login'));
const ChatPanelRoute = lazy(() => import('./routes/chatPanelRoute'));

enableLogging();

@inject('rootStore')
@observer
export class App extends Component<BaseComponentProps> {
  get rootStore() {
    return this.props.rootStore!;
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
      return <ChatPanelRoute />;
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
