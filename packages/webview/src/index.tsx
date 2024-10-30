import { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';

const App = lazy(() => import('./App'));

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  // TODO StrictMode render twice, need to fix
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>,
  <Suspense>
    <App />
  </Suspense>,
);
