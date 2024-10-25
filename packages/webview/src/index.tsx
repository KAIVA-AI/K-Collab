import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'mobx-react';
import { enableLogging } from 'mobx-logger';
import { rootStore } from './stores';
import { App } from './App';

import './index.css';
import '@vscode/codicons/dist/codicon.css';

enableLogging();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  // TODO StrictMode render twice, need to fix
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>,
  <Suspense>
    <Provider rootStore={rootStore}>
      <App />
    </Provider>
  </Suspense>,
);
