import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { io } from 'socket.io-client';

import App from './App';
import './index.css';
import store from './redux/store';
import getEnv from './lib/env';

export const socket = io(getEnv('SERVER_URL'), { withCredentials: true });
createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <Provider store={store}>
    <App />
  </Provider>
  // </StrictMode>
);
