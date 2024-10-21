import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ChatPage } from './pages/chat';
import { enableLogging } from 'mobx-logger';
import { useRootStore } from './stores';

import './index.css';
import '@vscode/codicons/dist/codicon.css';
import { Observer } from 'mobx-react';
import { TopicPage } from './pages/topic';

enableLogging();

function App() {
  const rootStore = useRootStore();
  useEffect(() => {
    rootStore.init();
  }, []);

  // TODO router client side not working yet because webview alway using route /, switch using server side rendering
  return (
    <Observer>
      {() => (
        <>{rootStore.topicStore.currentTopic ? <ChatPage /> : <TopicPage />}</>
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
  <App />,
);
