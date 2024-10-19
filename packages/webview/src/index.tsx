import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatPage } from './pages/chat';

import './index.css';
import '@vscode/codicons/dist/codicon.css';

function App() {
  // TODO router client side not working yet because webview alway using route /, switch using server side rendering
  return <ChatPage />;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
