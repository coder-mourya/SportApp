import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./index.css";
import { BrowserRouter as Router } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import ScrollToTop from "./components/ScrollToTop";
import "./i18next";
import { Provider } from 'react-redux';
import store from './store';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = document.getElementById('root');

ReactDOM.createRoot(root).render(
  <GoogleOAuthProvider clientId="865030813504-261tprrp2diikshoo2lv2kc5n6asv824.apps.googleusercontent.com">
  <Provider store={store}>
    <Router scrollRestoration="manual">
      <ScrollToTop />
      <App />
    </Router>
  </Provider>
  </GoogleOAuthProvider>
);

reportWebVitals();
