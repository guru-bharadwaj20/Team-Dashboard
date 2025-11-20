// MongoDB Setup Script for Team Dashboard
// Run this in your MongoDB Playground to set up the database

// Switch to your database (replace with your actual database name)
use('team-decision-board');

// 1. Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'passwordHash'],
      properties: {
        name: { bsonType: 'string' },
        email: { bsonType: 'string' },
        passwordHash: { bsonType: 'string' }
      }
    }
  }
});

db.createCollection('teams', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'members'],
      properties: {
        name: { bsonType: 'string' },
        description: { bsonType: 'string' },
        members: { bsonType: 'array' }
      }
    }
  }
});

db.createCollection('proposals', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'teamId', 'options'],
      properties: {
        title: { bsonType: 'string' },
        description: { bsonType: 'string' },
        teamId: { bsonType: 'objectId' },
        options: { bsonType: 'array' },
        responses: { bsonType: 'array' },
        status: { enum: ['open', 'closed'] }
      }
    }
  }
});

// 2. Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.teams.createIndex({ name: 1 });
db.proposals.createIndex({ teamId: 1 });
db.proposals.createIndex({ status: 1 });

// 3. Insert sample data (optional - for testing)
// You can comment this out if you want to start with an empty database

// Sample users (passwords are hashed versions of "password123")
const sampleUsers = db.users.insertMany([
  {
    name: 'Alice Smith',
    email: 'alice@example.com',
    passwordHash: '$2a$10$example1hashhere',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    passwordHash: '$2a$10$example2hashhere',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Sample teams
// const sampleTeams = db.teams.insertMany([
//   {
//     name: 'Development Team',
//     description: 'Core development team for product features',
//     members: [sampleUsers.insertedIds['0']],
//     createdAt: new Date(),
//     updatedAt: new Date()
//   },
//   {
//     name: 'Marketing Team',
//     description: 'Marketing and growth initiatives',
//     members: [sampleUsers.insertedIds['1']],
//     createdAt: new Date(),
//     updatedAt: new Date()
//   }
// ]);

// Sample proposals
db.proposals.insertMany([
  {
    title: 'Implement Dark Mode',
    description: 'Should we add a dark mode theme to the application?',
    teamId: sampleTeams.insertedIds['0'],
    options: [
      { _id: new ObjectId(), text: 'Agree' },
      { _id: new ObjectId(), text: 'Disagree' },
      { _id: new ObjectId(), text: 'Neutral' }
    ],
    responses: [],
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'New Marketing Campaign',
    description: 'Launch a social media campaign for Q4',
    teamId: sampleTeams.insertedIds['1'],
    options: [
      { _id: new ObjectId(), text: 'Agree' },
      { _id: new ObjectId(), text: 'Disagree' },
      { _id: new ObjectId(), text: 'Neutral' }
    ],
    responses: [],
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// 4. Verify setup
print('\n=== Database Setup Complete ===');
print('Users count:', db.users.countDocuments());
print('Teams count:', db.teams.countDocuments());
print('Proposals count:', db.proposals.countDocuments());
print('\nIndexes:');
print('Users indexes:', db.users.getIndexes());
print('Teams indexes:', db.teams.getIndexes());
print('Proposals indexes:', db.proposals.getIndexes());
