import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocialMediaProvider } from './contexts/SocialMediaContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocialMediaProvider>
          <App />
        </SocialMediaProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);