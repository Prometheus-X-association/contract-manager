// Ecosystem Contract Model
import mongoose, { Schema } from 'mongoose';
import { IContractDB } from '../interfaces/contract.interface';

// Purpose mongoose schema
const PurposeSchema = new Schema({
  uid: String,
  purpose: String,
  action: String,
  assigner: String,
  assignee: String,
  purposeCategory: String,
  consentType: String,
  piiCategory: String,
  primaryPurpose: String,
  termination: String,
  thirdPartyDisclosure: String,
  thirdPartyName: String,
});
// Constraints mongoose schemas
const DefaultConstraintSchema = new Schema(
  {
    '@type': String,
    leftOperand: String,
    operator: String,
    rightOperand: String,
  },
  { _id: false },
);
const UnknownConstraintSchema = new Schema(
  { '@type': String },
  { strict: false, _id: false },
);
// Signature mongoose schema
const SignatureSchema = new Schema(
  {
    did: { type: String, required: true },
    party: { type: String, required: true },
    value: { type: String, required: true },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);
// Contract mongoose schema
const ContractSchema: Schema = new Schema({
  uid: String,
  profile: String,
  permission: [
    {
      action: String,
      constraint: [DefaultConstraintSchema, UnknownConstraintSchema],
      _id: false,
    },
  ],
  prohibition: [
    {
      action: String,
      constraint: [DefaultConstraintSchema, UnknownConstraintSchema],
      _id: false,
    },
  ],
  purpose: [PurposeSchema],
  signatures: [SignatureSchema],
  revokedSignatures: [SignatureSchema],
  status: {
    type: String,
    enum: ['signed', 'revoked', 'pending'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  jsonLD: {
    type: String,
  },
});
// Create a MongoDB model based on the schema
export default mongoose.model<IContractDB>('Contract', ContractSchema);
