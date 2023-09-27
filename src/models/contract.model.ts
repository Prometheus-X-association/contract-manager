// Ecosystem Contract Model
import mongoose, { Schema } from 'mongoose';
import { IContractDB } from '../interfaces/contract.interface';

// Purpose mongoose schema
const PurposeSchema = new mongoose.Schema({
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
const DefaultConstraintSchema = new mongoose.Schema(
  {
    '@type': String,
    leftOperand: String,
    operator: String,
    rightOperand: String,
  },
  { _id: false },
);
const UnknownConstraintSchema = new mongoose.Schema(
  { '@type': String },
  { strict: false, _id: false },
);
// Signature mongoose schema
const SignatureSchema = new mongoose.Schema(
  {
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
    },
  ],
  purpose: [PurposeSchema],
  signatures: [SignatureSchema],
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
export default mongoose.model<IContractDB>('Contract', ContractSchema);
