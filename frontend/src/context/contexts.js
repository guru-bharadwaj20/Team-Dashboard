import { createContext } from 'react';

/**
 * Context objects live apart from their providers.
 *
 * A file that exports both a component and a non-component breaks React Fast
 * Refresh for that file (react-refresh/only-export-components), so the provider
 * components, the context objects and the consumer hooks are split three ways.
 */
export const AuthContext = createContext(null);
export const SocketContext = createContext(null);
export const ToastContext = createContext(null);
