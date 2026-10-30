import mongoose, { Schema, models, model } from 'mongoose';

const schema = new Schema({
  // The built-in unique _id index enforces one claim across workers, even with autoIndex disabled.
  _id: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// Cleanup only: correctness comes from _id uniqueness and timestamp validation, not TTL timing.
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default (models.DiscordInteractionReceipt || model('DiscordInteractionReceipt', schema)) as mongoose.Model<any>;
