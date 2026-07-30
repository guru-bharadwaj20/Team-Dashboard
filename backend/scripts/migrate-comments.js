/*
 * One-off migration: embedded Proposal.comments -> the Comment collection.
 *
 * Comments used to live in an unbounded array on each proposal. This copies any
 * that remain into the standalone collection, sets Proposal.commentCount, and
 * unsets the old array.
 *
 * Usage (from backend/):
 *   node scripts/migrate-comments.js          # report only, writes nothing
 *   node scripts/migrate-comments.js --apply  # perform the migration
 *
 * Safe to re-run: comments already migrated are matched on proposal + author +
 * creation time and skipped.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Comment from '../models/Comment.js';

dotenv.config();

const APPLY = process.argv.includes('--apply');

const run = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined in env');

  await mongoose.connect(uri);
  console.log(`Connected. Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}\n`);

  // Read through the driver, since `comments` is no longer in the Mongoose schema.
  const raw = mongoose.connection.db.collection('proposals');
  const cursor = raw.find({ comments: { $exists: true, $ne: [] } });

  let proposalsSeen = 0;
  let migrated = 0;
  let skipped = 0;

  for await (const doc of cursor) {
    proposalsSeen++;
    for (const c of doc.comments) {
      if (!c?.user || !c?.text) { skipped++; continue; }

      const createdAt = c.createdAt ? new Date(c.createdAt) : new Date();
      const exists = await Comment.findOne({
        proposalId: doc._id,
        user: c.user,
        createdAt,
      }).lean();

      if (exists) { skipped++; continue; }

      if (APPLY) {
        await Comment.create({
          proposalId: doc._id,
          teamId: doc.teamId,
          user: c.user,
          text: c.text,
          createdAt,
          updatedAt: createdAt,
        });
      }
      migrated++;
    }

    if (APPLY) {
      const count = await Comment.countDocuments({ proposalId: doc._id });
      await raw.updateOne(
        { _id: doc._id },
        { $set: { commentCount: count }, $unset: { comments: '' } }
      );
    }
  }

  console.log(`Proposals with embedded comments: ${proposalsSeen}`);
  console.log(`Comments ${APPLY ? 'migrated' : 'to migrate'}:        ${migrated}`);
  console.log(`Skipped (already present/invalid): ${skipped}`);
  if (!APPLY) console.log('\nDry run — nothing written. Re-run with --apply.');

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
