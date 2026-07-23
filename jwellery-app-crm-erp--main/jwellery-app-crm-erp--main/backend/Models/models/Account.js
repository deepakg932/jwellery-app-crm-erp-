// src/models/Account.js
import mongoose from 'mongoose';
import { AccountType } from './_shared.js';
const AccountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: AccountType, required: true },
  },
  { timestamps: true }
);
AccountSchema.index({ name: 1, type: 1 }, { unique: true });
export default mongoose.model('Account', AccountSchema);
