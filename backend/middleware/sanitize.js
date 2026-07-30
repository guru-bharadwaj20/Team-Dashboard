/**
 * Strips MongoDB query operators from user input.
 *
 * Mongoose casts values against the schema but still honours operator objects on
 * typed paths, so a body of {"email": {"$gt": ""}} turns an equality lookup into a
 * range scan that matches an arbitrary user. Any key beginning with `$`, or
 * containing a `.` (which would address a nested field), is removed.
 */
const scrub = (value, depth = 0) => {
  if (depth > 10 || value === null || typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) value[i] = scrub(value[i], depth + 1);
    return value;
  }

  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete value[key];
    } else {
      value[key] = scrub(value[key], depth + 1);
    }
  }
  return value;
};

export const sanitizeRequest = (req, res, next) => {
  // req.query and req.params are getter-backed on some Express versions, so they
  // are scrubbed in place rather than reassigned.
  if (req.body) scrub(req.body);
  if (req.query) scrub(req.query);
  if (req.params) scrub(req.params);
  next();
};
