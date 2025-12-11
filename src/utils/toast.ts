import toast from 'react-hot-toast';

// Configuração personalizada para os toasts
const toastConfig = {
  duration: 4000,
  position: 'top-right' as const,
  style: {
    background: '#1a2c20',
    color: '#fff',
    border: '1px solid #2d4a37',
    padding: '16px',
    borderRadius: '8px',
    maxWidth: '500px',
  },
};

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      ...toastConfig,
      icon: '✅',
      style: {
        ...toastConfig.style,
        border: '1px solid #22c55e',
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      ...toastConfig,
      icon: '❌',
      duration: 5000,
      style: {
        ...toastConfig.style,
        border: '1px solid #ef4444',
      },
    });
  },

  warning: (message: string) => {
    toast(message, {
      ...toastConfig,
      icon: '⚠️',
      style: {
        ...toastConfig.style,
        border: '1px solid #f59e0b',
      },
    });
  },

  info: (message: string) => {
    toast(message, {
      ...toastConfig,
      icon: 'ℹ️',
      style: {
        ...toastConfig.style,
        border: '1px solid #3b82f6',
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      ...toastConfig,
      duration: Infinity,
    });
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      toastConfig
    );
  },
};
