/**
 * One-time migration: rename expirationDate → userExpirationDate
 * and planExpiresAt → planExpirationDate on all Url documents.
 *
 * Run BEFORE deploying the updated app code:
 *   npx tsx src/scripts/migrate-expiration-fields.ts
 */
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set in environment');

  await mongoose.connect(uri);
  console.log('[Migration] Connected to MongoDB');

  const result = await mongoose.connection.collection('urls').updateMany(
    {},
    {
      $rename: {
        expirationDate: 'userExpirationDate',
        planExpiresAt: 'planExpirationDate',
      },
    }
  );

  console.log(`[Migration] Done. Modified ${result.modifiedCount} documents.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[Migration] Failed:', err);
  process.exit(1);
});
