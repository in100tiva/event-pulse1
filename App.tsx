import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Authenticated, Unauthenticated, AuthLoading } from 'convex/react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateEvent from './components/CreateEvent';
import EventManagement from './components/EventManagement';
import PublicEvent from './components/PublicEvent';
import ProjectionView from './components/ProjectionView';

const AppContent: React.FC = () => {

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota de login - apenas para não autenticados */}
        <Route
          path="/login"
          element={
            <>
              <SignedOut>
                <Login />
              </SignedOut>
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>
            </>
          }
        />

        {/* Rotas protegidas - requerem autenticação */}
        <Route
          path="/dashboard"
          element={
            <Authenticated>
              <Dashboard />
            </Authenticated>
          }
        />
        <Route
          path="/create-event"
          element={
            <Authenticated>
              <CreateEvent />
            </Authenticated>
          }
        />
        <Route
          path="/edit-event/:eventId"
          element={
            <Authenticated>
              <CreateEvent />
            </Authenticated>
          }
        />
        <Route
          path="/manage/:shareCode"
          element={
            <Authenticated>
              <EventManagement />
            </Authenticated>
          }
        />
        <Route
          path="/projection/:shareCode"
          element={
            <Authenticated>
              <ProjectionView />
            </Authenticated>
          }
        />

        {/* Rotas públicas - não requerem autenticação */}
        <Route path="/event/:code" element={<PublicEvent />} />

        {/* Rota raiz */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <>
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a2c20',
            color: '#fff',
            border: '1px solid #2d4a37',
            borderRadius: '8px',
          },
          success: {
            duration: 3000,
            style: {
              border: '1px solid #22c55e',
            },
          },
          error: {
            duration: 5000,
            style: {
              border: '1px solid #ef4444',
            },
          },
        }}
      />
      <AppContent />
    </>
  );
};

export default App;