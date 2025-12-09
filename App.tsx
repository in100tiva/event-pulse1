import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Authenticated, Unauthenticated, AuthLoading } from 'convex/react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateEvent from './components/CreateEvent';
import EventManagement from './components/EventManagement';
import PublicEvent from './components/PublicEvent';
import ProjectionView from './components/ProjectionView';

const App: React.FC = () => {
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

export default App;