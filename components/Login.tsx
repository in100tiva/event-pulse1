import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';

const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [isSignUp, setIsSignUp] = React.useState(mode === 'sign-up');

  // Sincronizar com parâmetro da URL
  React.useEffect(() => {
    setIsSignUp(mode === 'sign-up');
  }, [mode]);

  const commonAppearance = {
    variables: {
      colorPrimary: "#13ec5b",
      colorBackground: "#1a2c20",
      colorInputBackground: "#102216",
      colorInputText: "#f0f4f2",
      colorText: "#f0f4f2",
      colorTextSecondary: "#a1bfaa",
      colorDanger: "#ef4444",
      colorSuccess: "#13ec5b",
      colorWarning: "#f59e0b",
      colorNeutral: "#a1bfaa",
      borderRadius: "0.5rem",
    },
    elements: {
      rootBox: "mx-auto w-full",
      card: "bg-[#1a2c20] border border-[#2a3f31] shadow-xl rounded-xl",
      headerTitle: "text-white font-semibold",
      headerSubtitle: "text-[#a1bfaa]",
      socialButtonsBlockButton: "bg-white hover:bg-gray-100 border border-gray-200 text-gray-700",
      socialButtonsBlockButtonText: "text-gray-700 font-medium",
      dividerLine: "bg-[#2a3f31]",
      dividerText: "text-[#a1bfaa]",
      formFieldLabel: "text-[#a1bfaa]",
      formFieldInput: "bg-[#102216] border-[#2a3f31] text-white placeholder:text-[#6b8a74] focus:border-[#13ec5b] focus:ring-[#13ec5b]",
      formButtonPrimary: "bg-[#13ec5b] hover:bg-[#0fae43] text-black font-semibold",
      footerActionLink: "text-[#13ec5b] hover:text-[#0fae43]",
      footerActionText: "text-[#a1bfaa]",
      identityPreviewText: "text-white",
      identityPreviewEditButton: "text-[#13ec5b] hover:text-[#0fae43]",
      formFieldAction: "text-[#13ec5b] hover:text-[#0fae43]",
      alertText: "text-white",
      formFieldInputShowPasswordButton: "text-[#a1bfaa] hover:text-white",
      otpCodeFieldInput: "bg-[#102216] border-[#2a3f31] text-white",
      formResendCodeLink: "text-[#13ec5b] hover:text-[#0fae43]",
      badge: "bg-[#13ec5b] text-black",
    }
  };

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
              {isSignUp ? (
                <SignUp
                  fallbackRedirectUrl="/dashboard"
                  signInUrl="/login"
                  appearance={commonAppearance}
                />
              ) : (
                <SignIn
                  fallbackRedirectUrl="/dashboard"
                  signUpUrl="/login?mode=sign-up"
                  appearance={commonAppearance}
                />
              )}
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#13ec5b] hover:text-[#0fae43] text-sm font-medium transition-colors"
              >
                {isSignUp 
                  ? "Já tem uma conta? Faça login" 
                  : "Não tem uma conta? Criar conta"}
              </button>
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