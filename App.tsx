import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateEvent from './components/CreateEvent';
import EventManagement from './components/EventManagement';
import PublicEvent from './components/PublicEvent';
import ProjectionView from './components/ProjectionView';
import queryClient from './src/lib/queryClient';
import { useAuthSetup } from './src/lib/hooks';

// Componente para configurar auth e rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }
  
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  // Setup auth token provider for API
  useAuthSetup();

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
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-event"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-event/:eventId"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/:shareCode"
          element={
            <ProtectedRoute>
              <EventManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projection/:shareCode"
          element={
            <ProtectedRoute>
              <ProjectionView />
            </ProtectedRoute>
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
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
};

export default App;
