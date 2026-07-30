import js from '@eslint/js';
import globals from 'globals';

/**
 * The backend had no linting at all — the only ESLint config in the repo was the
 * frontend's, so server code was never checked.
 */
export default [
  {
    ignores: ['node_modules/**', 'setup-database.mongodb.js'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          // Express identifies error handlers by arity, so the trailing `next`
          // must stay in the signature even though it is unused.
          caughtErrors: 'none',
        },
      ],
      // All server logging goes through utils/logger.js.
      'no-console': 'error',
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'warn',
    },
  },
  {
    // The logger is the one place allowed to touch console.
    files: ['utils/logger.js'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    // Migration and ops scripts are run by hand and report to stdout.
    files: ['scripts/**/*.js'],
    rules: { 'no-console': 'off' },
  },
];
