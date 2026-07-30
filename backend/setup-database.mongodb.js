/*
 * MongoDB setup for Team Decision Board.
 *
 * Run inside the VS Code MongoDB extension's playground, or with:
 *   mongosh "<your-connection-string>" backend/setup-database.mongodb.js
 *
 * Creates the collections, applies schema validation matching the Mongoose
 * models, and builds the indexes those models declare. It is idempotent: running
 * it against an existing database updates validators and indexes without
 * touching data.
 *
 * No seed data is inserted. The previous version referenced a `sampleTeams`
 * variable that was commented out, so it threw a ReferenceError partway through,
 * and the sample users it did insert carried placeholder password hashes
 * ('$2a$10$example1hashhere') that nobody could ever log in with. Create real
 * accounts through POST /api/auth/register, which hashes properly and applies
 * the password policy.
 */

use('team-decision-board');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const objectId = (description) => ({ bsonType: 'objectId', description });
const string = (description) => ({ bsonType: 'string', description });

/** Creates the collection if absent, otherwise updates its validator in place. */
function ensureCollection(name, validator) {
  const exists = db.getCollectionNames().indexOf(name) !== -1;
  if (exists) {
    db.runCommand({ collMod: name, validator, validationLevel: 'moderate' });
    print(`updated validator: ${name}`);
  } else {
    db.createCollection(name, { validator });
    print(`created collection: ${name}`);
  }
}

// ─── Collections ──────────────────────────────────────────────────────────────

ensureCollection('users', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name', 'email', 'passwordHash'],
    properties: {
      name: string('display name'),
      email: string('lowercased, unique'),
      passwordHash: string('bcrypt hash'),
      role: { enum: ['user', 'admin'], description: 'authorization role' },
    },
  },
});

ensureCollection('teams', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name', 'members', 'creator', 'shareId'],
    properties: {
      name: string('team name'),
      description: string('optional summary'),
      members: { bsonType: 'array', items: objectId('user id') },
      creator: objectId('owning user'),
      shareId: string('public board share code'),
    },
  },
});

ensureCollection('proposals', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['title', 'teamId', 'options', 'creator'],
    properties: {
      title: string('proposal title'),
      description: string('optional detail'),
      teamId: objectId('owning team'),
      creator: objectId('author'),
      options: { bsonType: 'array', items: { bsonType: 'object' } },
      votes: { bsonType: 'array', items: { bsonType: 'object' } },
      comments: { bsonType: 'array', items: { bsonType: 'object' } },
      // All four states the Mongoose model allows. The old validator listed only
      // open/closed, so writing a resolved proposal would have been rejected.
      status: { enum: ['open', 'closed', 'pending', 'resolved'] },
      consensusReached: { bsonType: 'bool' },
      consensusPercentage: { bsonType: ['int', 'double'] },
      deadline: { bsonType: 'date' },
      closedAt: { bsonType: 'date' },
    },
  },
});

ensureCollection('notifications', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['userId', 'title', 'message'],
    properties: {
      userId: objectId('recipient'),
      type: { enum: ['info', 'success', 'warning', 'error'] },
      title: string('headline'),
      message: string('body'),
      read: { bsonType: 'bool' },
      relatedType: { enum: ['proposal', 'team', 'comment'] },
    },
  },
});

ensureCollection('activities', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['action'],
    properties: {
      userId: objectId('actor'),
      userName: string('denormalised actor name'),
      action: {
        enum: [
          'team.created', 'team.deleted', 'team.member_joined',
          'proposal.created', 'proposal.deleted', 'proposal.resolved',
          'vote.cast', 'vote.changed',
          'comment.added',
        ],
      },
      targetType: { enum: ['team', 'proposal', 'comment'] },
      teamId: objectId('scoping team'),
    },
  },
});

ensureCollection('contacts', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name', 'email', 'subject', 'message'],
    properties: {
      name: string('sender name'),
      email: string('sender email'),
      subject: string('subject line'),
      message: string('body'),
      status: { enum: ['new', 'read', 'responded'] },
    },
  },
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Mirrors the indexes declared on the Mongoose models.

db.users.createIndex({ email: 1 }, { unique: true });

db.teams.createIndex({ shareId: 1 }, { unique: true });
db.teams.createIndex({ members: 1 });
db.teams.createIndex({ creator: 1 });

db.proposals.createIndex({ teamId: 1, createdAt: -1 });
db.proposals.createIndex({ status: 1 });
db.proposals.createIndex({ creator: 1 });

db.notifications.createIndex({ userId: 1, createdAt: -1 });
db.notifications.createIndex({ userId: 1, read: 1 });

db.activities.createIndex({ createdAt: -1 });
db.activities.createIndex({ teamId: 1, createdAt: -1 });
db.activities.createIndex({ userId: 1 });
db.activities.createIndex({ action: 1 });

db.contacts.createIndex({ createdAt: -1 });
db.contacts.createIndex({ status: 1 });

// ─── Verify ───────────────────────────────────────────────────────────────────

print('\n=== Database setup complete ===');
for (const name of ['users', 'teams', 'proposals', 'notifications', 'activities', 'contacts']) {
  print(`${name}: ${db.getCollection(name).countDocuments()} documents`);
}
print('\nRegister a first account via POST /api/auth/register.');
