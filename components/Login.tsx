import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const Login: React.FC = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center items-center py-10 px-4">
          <div className="layout-content-container flex flex-col w-full max-w-md flex-1">
            
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-4xl">heart_check</span>
                <h1 className="text-3xl font-bold tracking-tight text-white">EventPulse</h1>
              </div>
            </div>

            <div className="flex justify-center">
              <SignIn 
                fallbackRedirectUrl="/dashboard"
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "bg-[#1a2c20] border border-border-dark shadow-lg",
                  }
                }}
              />
            </div>

            <p className="text-gray-400 text-xs text-center mt-8 max-w-sm mx-auto">
              Participantes podem entrar em eventos sem conta. Registro é apenas para organizadores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;