import mongoose, { Schema } from 'mongoose';
import { IBilateralContractDB } from '../interfaces/contract.interface';

// Bilateral Contract Model
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
const BilateralConstraintSchema = new mongoose.Schema(
  {
    '@type': String,
    leftOperand: String,
    operator: String,
    rightOperand: mongoose.Schema.Types.Mixed,
  },
  { strict: false, _id: false },
);

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
const ConsequenceSchema = new Schema(
  {
    action: String,
    constraint: [BilateralConstraintSchema],
    consequence: [this],
  },
  { _id: false },
);
const DutySchema = new Schema(
  {
    action: String,
    constraint: [BilateralConstraintSchema],
    consequence: [ConsequenceSchema],
  },
  { _id: false },
);
const PolicySchema = new Schema(
  {
    uid: String,
    description: String,
    permission: [
      {
        action: String,
        target: String,
        duty: [DutySchema],
        constraint: [BilateralConstraintSchema],
        _id: false,
      },
    ],
    prohibition: [
      {
        action: String,
        target: String,
        constraint: [BilateralConstraintSchema],
        _id: false,
      },
    ],
  },
  { _id: false },
);
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
export default mongoose.model<IBilateralContractDB>(
  'BilateralContract',
  BilateralContractSchema,
);
