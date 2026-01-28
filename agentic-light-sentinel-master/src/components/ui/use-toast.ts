import { TOAST_DURATION, type ToastActionElement, type ToastProps } from '@/components/ui/toast';

const useToast = () => {
  function toast({ title, description, variant, action }: ToastProps & { action?: ToastActionElement }) {
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
    document.dispatchEvent(event);
  }

  return {
    toast,
    dismiss: () => {
      document.dispatchEvent(new CustomEvent('toast-dismiss'));
    },
  };
};

export { useToast, type ToastProps };

export function toast(props: ToastProps) {
  const { toast: showToast } = useToast();
  showToast(props);
}