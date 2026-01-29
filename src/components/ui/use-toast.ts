import { type ToastActionElement, type ToastProps } from '@/components/ui/Toast';

// Toast duration in milliseconds
const TOAST_DURATION = 4000;

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  action?: ToastActionElement;
}

const useToast = () => {
  const toast = ({ title, description, variant, action }: ToastOptions) => {
    // Dispatch a custom event that will be handled by the Toaster component
    const event = new CustomEvent('toast', {
      detail: {
        title,
        description,
        variant,
        action,
        duration: TOAST_DURATION,
      },
    });
    if (typeof document !== 'undefined') {
      document.dispatchEvent(event);
    }
  };

  return {
    toast,
    dismiss: () => {
      if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('toast-dismiss'));
      }
    },
  };
};

export { useToast, type ToastProps };

// Standalone toast function (cannot use hooks, dispatches event directly)
export function toast(props: ToastOptions) {
  const event = new CustomEvent('toast', {
    detail: {
      ...props,
      duration: TOAST_DURATION,
    },
  });
  if (typeof document !== 'undefined') {
    document.dispatchEvent(event);
  }
}