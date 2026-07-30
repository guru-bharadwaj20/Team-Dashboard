/**
 * Minimal levelled logger.
 *
 * The codebase had ~34 bare console.* calls with no levels, no timestamps and no
 * way to quieten them in tests. This keeps the zero-dependency footprint while
 * giving structured JSON in production (parseable by any log aggregator) and
 * readable lines in development.
 *
 * LOG_LEVEL: error | warn | info | debug   (default: info, or error under test)
 */

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const configuredLevel = () => {
  const fromEnv = (process.env.LOG_LEVEL || '').toLowerCase();
  if (fromEnv in LEVELS) return LEVELS[fromEnv];
  if (process.env.NODE_ENV === 'test') return LEVELS.error;
  return LEVELS.info;
};

const isProd = () => process.env.NODE_ENV === 'production';

const emit = (level, args) => {
  if (LEVELS[level] > configuredLevel()) return;

  const time = new Date().toISOString();
  const sink = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;

  if (isProd()) {
    // One JSON object per line, so aggregators can index the fields.
    const [first, ...rest] = args;
    sink(
      JSON.stringify({
        time,
        level,
        msg: typeof first === 'string' ? first : undefined,
        detail: rest.length ? rest : undefined,
        ...(typeof first === 'object' && first !== null ? { data: first } : {}),
      })
    );
    return;
  }

  sink(`[${time}] ${level.toUpperCase().padEnd(5)}`, ...args);
};

export const logger = {
  error: (...args) => emit('error', args),
  warn: (...args) => emit('warn', args),
  info: (...args) => emit('info', args),
  debug: (...args) => emit('debug', args),
};

export default logger;
