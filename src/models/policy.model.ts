import mongoose, { Schema } from 'mongoose';
import { IPolicyDB } from '../interfaces/policy.interface';

const policySchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  jsonLD: { type: String, required: true },
});
policySchema.index({ description: 'text' });
export default mongoose.model<IPolicyDB>('Policy', policySchema);
