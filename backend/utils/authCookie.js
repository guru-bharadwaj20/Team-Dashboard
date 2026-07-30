const isProd = () => process.env.NODE_ENV === 'production';

export const AUTH_COOKIE = 'token';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Cookie options for the auth token.
 *
 * httpOnly keeps the token out of reach of JavaScript, so an XSS bug can no longer
 * exfiltrate a session. In production the API and SPA are on different origins, so
 * the cookie must be SameSite=None, which browsers only accept alongside Secure.
 */
const options = () => ({
  httpOnly: true,
  secure: isProd(),
  sameSite: isProd() ? 'none' : 'lax',
  maxAge: SEVEN_DAYS_MS,
  path: '/',
});

export const setAuthCookie = (res, token) => res.cookie(AUTH_COOKIE, token, options());

export const clearAuthCookie = (res) =>
  res.clearCookie(AUTH_COOKIE, { ...options(), maxAge: undefined });
