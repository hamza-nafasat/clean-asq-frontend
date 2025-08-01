import { StrictMode } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { io } from 'socket.io-client';

import App from './App';
import './index.css';
import store from './redux/store';
import getEnv from './lib/env';

export const socket = io(getEnv('SERVER_URL'), { withCredentials: true });

const container = document.getElementById('root');
// Create the root exactly once
const root = createRoot(container);

root.render(
  <LoadScript googleMapsApiKey={'AIzaSyCjIrS-bOHBzGviCsSHDZZUf9F9oonZGnU'} libraries={['places']}>
    <Provider store={store}>
      <App />
    </Provider>
  </LoadScript>
);
