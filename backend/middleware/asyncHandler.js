/**
 * Wraps an async route handler so a rejected promise reaches the error handler.
 *
 * Without this, every controller had to carry its own try/catch and respond
 * directly, which meant the errorHandler middleware was never reached — it was
 * registered but effectively dead, because nothing ever called next(err).
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
