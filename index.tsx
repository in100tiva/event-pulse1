import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import App from './App';
import { ClerkProvider } from "@clerk/clerk-react";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

// Desabilitar proxy em desenvolvimento local
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={clerkPubKey}
      {...(isDevelopment ? { domain: undefined } : {})}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
