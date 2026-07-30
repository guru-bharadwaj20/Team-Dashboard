
import { useToast } from '../hooks/useToast.js';
import { ToastContainer } from '../components/common/Toast.jsx';
import { ToastContext } from './contexts.js';

/**
 * Application-wide toasts.
 *
 * The Toast component and useToast hook already existed but were imported by
 * nothing; user feedback went through window.alert instead. This wires them up
 * once at the root so any page can raise a toast.
 */
export const ToastProvider = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} dismiss={toast.dismiss} />
    </ToastContext.Provider>
  );
};
