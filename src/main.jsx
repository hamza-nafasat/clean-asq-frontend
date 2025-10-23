import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { LoadScript } from '@react-google-maps/api';
import App from './App';
import store from './redux/store';
import getEnv from './lib/env';
import './index.css';
import { io } from 'socket.io-client';
import { BrandingProvider } from './hooks/BrandingContext';
import { BrowserRouter } from 'react-router-dom';

export const socket = io(getEnv('SERVER_URL'), {
  path: '/api/socket.io',
  withCredentials: true,
});

const container = document.getElementById('root');

// Avoid creating multiple roots
if (!container._reactRoot) {
  const root = createRoot(container);
  container._reactRoot = root;
  root.render(
    // <StrictMode>
    <LoadScript googleMapsApiKey={'AIzaSyCjIrS-bOHBzGviCsSHDZZUf9F9oonZGnU'} libraries={['places']}>
      <BrandingProvider>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </BrandingProvider>
    </LoadScript>
    // </StrictMode>
  );
}
