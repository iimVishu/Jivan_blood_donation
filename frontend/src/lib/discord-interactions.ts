import dbConnect from '@/lib/db';
import DiscordInteractionReceipt from '@/models/DiscordInteractionReceipt';

const MAX_REQUEST_AGE_MS = 5 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 30 * 1000;
const RECEIPT_RETENTION_MS = 24 * 60 * 60 * 1000;

export function isFreshDiscordTimestamp(timestamp: string | null, now = Date.now()) {
  if (!timestamp || !/^\d{1,12}$/.test(timestamp)) return false;
  const signedAt = Number(timestamp) * 1000;
  return Number.isSafeInteger(signedAt) &&
    now - signedAt <= MAX_REQUEST_AGE_MS && signedAt - now <= MAX_FUTURE_SKEW_MS;
}

export async function consumeDiscordInteraction(applicationId: string, interactionId: string, timestamp: string) {
  if (!isFreshDiscordTimestamp(timestamp)) throw new Error('Discord interaction expired before processing');
  await dbConnect();
  // Recheck after connection setup, which may have waited for the database.
  if (!isFreshDiscordTimestamp(timestamp)) throw new Error('Discord interaction expired before processing');
  try {
    await DiscordInteractionReceipt.create([{
      _id: `${applicationId}:${interactionId}`,
      expiresAt: new Date(Date.now() + RECEIPT_RETENTION_MS),
    }], { writeConcern: { w: 'majority' } });
    return true;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) return false;
    // Database failures must never fall back to an unprotected appointment update.
    throw error;
  }
}
