import { body, param, query, validationResult } from 'express-validator';
import { MIN_PASSWORD_LENGTH, validatePassword } from '../utils/validators.js';

/**
 * Declarative request validation at the route boundary.
 *
 * express-validator was a declared dependency that nothing imported, while the
 * README claimed it guarded every write endpoint. Validation instead lived as
 * ad-hoc `if (!x)` blocks inside each controller. These chains move the checks to
 * the routes and give every endpoint a consistent 400 shape.
 */

/** Terminates a chain: turns accumulated errors into one 400 response. */
export const check = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array();
  res.status(400).json({
    // First message stays in `message` so existing clients keep working.
    message: errors[0].msg,
    errors: errors.map((e) => ({ field: e.path, message: e.msg })),
  });
};

const objectId = (name, location = param) =>
  location(name).isMongoId().withMessage('Invalid id');

const password = (field) =>
  body(field).custom((value) => {
    const error = validatePassword(value);
    if (error) throw new Error(error);
    return true;
  });

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const validateRegister = [
  body('name')
    .isString().withMessage('Name is required')
    .trim()
    .isLength({ min: 1, max: 80 }).withMessage('Name is required and must be at most 80 characters'),
  body('email')
    .isString().withMessage('Please provide a valid email address')
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .isLength({ max: 254 }).withMessage('Email must be at most 254 characters')
    .normalizeEmail({ gmail_remove_dots: false }),
  password('password'),
  check,
];

export const validateLogin = [
  body('email').isString().trim().notEmpty().withMessage('Email is required'),
  body('password').isString().notEmpty().withMessage('Password is required'),
  check,
];

export const validateUpdateProfile = [
  body('name').optional().isString().trim().isLength({ min: 1, max: 80 })
    .withMessage('Name must be between 1 and 80 characters'),
  body('email').optional()
    .isString().withMessage('Please provide a valid email address')
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .isLength({ max: 254 }).withMessage('Email must be at most 254 characters')
    .normalizeEmail({ gmail_remove_dots: false }),
  check,
];

export const validateChangePassword = [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
  password('newPassword').withMessage(`New password must be at least ${MIN_PASSWORD_LENGTH} characters`),
  check,
];

// ─── Teams ────────────────────────────────────────────────────────────────────

export const validateCreateTeam = [
  body('name')
    .isString().withMessage('Team name is required')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Team name is required and must be at most 100 characters'),
  body('description').optional({ nullable: true }).isString().trim().isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters'),
  check,
];

export const validateUpdateTeam = [
  objectId('id'),
  body('name').optional().isString().trim().isLength({ min: 1, max: 100 })
    .withMessage('Team name must be between 1 and 100 characters'),
  body('description').optional({ nullable: true }).isString().trim().isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters'),
  check,
];

export const validateJoinTeam = [
  body('shareId').isString().trim().notEmpty().withMessage('A team share code is required'),
  check,
];

export const validateTeamId = [objectId('id'), check];
export const validateTeamIdParam = [objectId('teamId'), check];

// ─── Proposals ────────────────────────────────────────────────────────────────

export const validateCreateProposal = [
  objectId('teamId'),
  body('title')
    .isString().withMessage('Title is required')
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Title is required and must be at most 200 characters'),
  body('description').optional({ nullable: true }).isString().trim().isLength({ max: 5000 })
    .withMessage('Description must be at most 5000 characters'),
  body('options').isArray({ min: 2, max: 5 })
    .withMessage('Provide between 2 and 5 options'),
  body('options.*')
    .isString().withMessage('Each option must be text')
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Each option must be text of at most 200 characters'),
  body('options').custom((options) => {
    const cleaned = options.map((o) => String(o).trim().toLowerCase());
    if (new Set(cleaned).size !== cleaned.length) throw new Error('Options must be unique');
    return true;
  }),
  body('deadline').optional({ nullable: true }).isISO8601()
    .withMessage('Deadline is not a valid date'),
  check,
];

export const validateProposalId = [objectId('id'), check];

export const validateVote = [
  objectId('id'),
  body('vote').isIn(['agree', 'disagree', 'neutral'])
    .withMessage('vote must be agree, disagree, or neutral'),
  check,
];

export const validateAddComment = [
  objectId('id'),
  body('text')
    .isString().withMessage('Comment text is required')
    .trim()
    .isLength({ min: 1, max: 2000 }).withMessage('Comment must be between 1 and 2000 characters'),
  check,
];

// ─── Contact ──────────────────────────────────────────────────────────────────

export const validateContact = [
  body('name').isString().trim().isLength({ min: 1, max: 80 })
    .withMessage('Please provide your name'),
  body('email')
    .isString().withMessage('Please provide a valid email address')
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .isLength({ max: 254 }).withMessage('Email must be at most 254 characters')
    .normalizeEmail({ gmail_remove_dots: false }),
  body('subject').isString().trim().isLength({ min: 1, max: 200 })
    .withMessage('Please provide a subject'),
  body('message')
    .isString().withMessage('Message is required')
    .trim()
    .isLength({ min: 10, max: 5000 }).withMessage('Message must be between 10 and 5000 characters'),
  check,
];

export const validateContactStatus = [
  objectId('id'),
  body('status').isIn(['new', 'read', 'responded'])
    .withMessage('Invalid status. Must be: new, read, or responded'),
  check,
];

export const validateContactId = [objectId('id'), check];

// ─── Shared ───────────────────────────────────────────────────────────────────

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  check,
];

export const validateExport = [
  objectId('id'),
  query('format').optional().isIn(['markdown', 'pdf']).withMessage('format must be markdown or pdf'),
  check,
];
