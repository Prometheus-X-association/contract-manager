import mongoose, { Schema } from 'mongoose';
import { PolicyReferenceRegistry } from '../interfaces/schemas.interface';

// Mongoose schema for an authorization policy
const AuthorisationPolicySchema: Schema = new Schema(
  {
    subject: { type: String, required: true },
    action: { type: String, required: true },
    conditions: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);
// Mongoose schema for a registry of reference policies
const PolicyReferenceRegistrySchema: Schema = new Schema({
  policies: [AuthorisationPolicySchema],
});
// Mongoose model for PolicyReferenceRegistry
export default mongoose.model<PolicyReferenceRegistry>(
  'PolicyReferenceRegistry',
  PolicyReferenceRegistrySchema,
);
