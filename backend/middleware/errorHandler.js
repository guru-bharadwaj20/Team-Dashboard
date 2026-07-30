const isProd = () => process.env.NODE_ENV === 'production';

/** 404 for any /api route that matched no handler. */
export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
};

/**
 * Terminal error handler.
 *
 * Translates the error shapes this app actually produces into sane status codes,
 * and never leaks internals to the client in production. Controllers reach it by
 * throwing (see asyncHandler) rather than each formatting its own 500.
 */
// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity
export const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode;
  let message = err.message || 'Internal Server Error';

  // Mongoose/Mongo failures that are really client mistakes.
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors || {})[0]?.message || 'Validation failed';
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    message = field ? `That ${field} is already in use` : 'Duplicate value';
  }

  if (!status || status < 400) status = 500;

  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${status}: ${err.message}`
  );
  if (!isProd()) console.error(err.stack);

  // A 500 message can carry driver or filesystem detail, so it is replaced in
  // production; 4xx messages are written for users and are safe to send.
  const body = {
    message: status >= 500 && isProd() ? 'Internal Server Error' : message,
  };
  if (!isProd()) body.stack = err.stack;

  res.status(status).json(body);
};
