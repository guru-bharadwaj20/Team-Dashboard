const isProd = process.env.NODE_ENV === 'production';

export const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || 'Internal Server Error';

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${status}: ${message}`);
  if (!isProd) console.error(err.stack);

  res.status(status).json({ message, ...(isProd ? {} : { stack: err.stack }) });
};
