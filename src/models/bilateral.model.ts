import mongoose, { Schema } from 'mongoose';
import { IBilateralContractDB } from '../interfaces/contract.interface';

// Purpose mongoose schema
const BilateralPurposeSchema = new mongoose.Schema({
  uid: String,
  purpose: String,
  action: String,
  assigner: String,
  assignee: String,
  piiCategory: [String],
  consentType: String,
  primaryPurpose: Boolean,
  termination: String,
  thirdPartyDisclosure: Boolean,
  thirdPartyName: String,
});
// Constraints mongoose schemas
const BilateralDefaultConstraintSchema = new mongoose.Schema(
  {
    '@type': String,
    leftOperand: String,
    operator: String,
    rightOperand: mongoose.Schema.Types.Mixed,
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
//
const PolicySchema = new Schema(
  {
    permission: [
      {
        action: String,
        target: String,
        constraint: [
          BilateralDefaultConstraintSchema,
          BilateralUnknownConstraintSchema,
        ],
        _id: false,
      },
    ],
    prohibition: [
      {
        action: String,
        target: String,
        constraint: [
          BilateralDefaultConstraintSchema,
          BilateralUnknownConstraintSchema,
        ],
        _id: false,
      },
    ],
    description: String,
  },
  { _id: false },
);
// Contract mongoose schema
const BilateralContractSchema: Schema = new Schema(
  {
    uid: String,
    dataProvider: String,
    dataConsumer: String,
    serviceOffering: String,
    profile: String,
    policy: [PolicySchema],
    purpose: [BilateralPurposeSchema],
    signatures: [BilateralSignatureSchema],
    revokedSignatures: [BilateralSignatureSchema],
    negotiators: [{ did: String }],
    status: {
      type: String,
      enum: ['signed', 'revoked', 'under_negotiation', 'pending'],
      default: 'pending',
    },
    terminationAndValidity: {
      effectiveDate: Date,
      terminationPeriod: Date,
    },
    limitationOfLiability: Date,
    termsAndConditions: String,
    jsonLD: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
// Create a MongoDB model based on the schema
export default mongoose.model<IBilateralContractDB>(
  'BilateralContract',
  BilateralContractSchema,
);
