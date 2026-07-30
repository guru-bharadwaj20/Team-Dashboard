import { useContext } from 'react';
import { ToastContext } from '../context/contexts.js';

export const useToastContext = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
};
