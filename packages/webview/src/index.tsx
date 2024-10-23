import { lazy, Suspense, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Observer, Provider } from 'mobx-react';
import { enableLogging } from 'mobx-logger';
import { useRootStore, rootStore } from './stores';

import './index.css';
import '@vscode/codicons/dist/codicon.css';

const TopicPage = lazy(() => import('./pages/topic/topic'));
const ChatPage = lazy(() => import('./pages/chat/chat'));

enableLogging();

function App() {
  const rootStore = useRootStore();
  useEffect(() => {
    rootStore.init();
  }, []);
  // TODO version check

  // TODO router client side not working yet because webview alway using route /, switch using server side rendering
  return (
    <Observer>
      {() => (
        <Suspense>
          {rootStore.topicStore.currentTopic ? <ChatPage /> : <TopicPage />}
        </Suspense>
      )}
    </Observer>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  // TODO StrictMode render twice, need to fix
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>,
  <Provider rootStore={rootStore}>
    <App />
  </Provider>,
);
