import mongoose, { Schema } from 'mongoose';
import { IBilateralContractDB } from '../interfaces/contract.interface';

// Purpose mongoose schema
const BilateralPurposeSchema = new mongoose.Schema({
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
const BilateralDefaultConstraintSchema = new mongoose.Schema(
  {
    '@type': String,
    leftOperand: String,
    operator: String,
    rightOperand: String,
  },
  { _id: false },
);
const BilateralUnknownConstraintSchema = new mongoose.Schema(
  { '@type': String },
  { strict: false, _id: false },
);
// Signature mongoose schema
const BilateralSignatureSchema = new mongoose.Schema(
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
const BilateralContractSchema: Schema = new Schema({
  uid: String,
  profile: String,
  permission: [
    {
      action: String,
      constraint: [
        BilateralDefaultConstraintSchema,
        BilateralUnknownConstraintSchema,
      ],
    },
  ],
  purpose: [BilateralPurposeSchema],
  signatures: [BilateralSignatureSchema],
  participants: [{ did: String }],
  signed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// Create a MongoDB model based on the schema
export default mongoose.model<IBilateralContractDB>(
  'BilateralContract',
  BilateralContractSchema,
);
