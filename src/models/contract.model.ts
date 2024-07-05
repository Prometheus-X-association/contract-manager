// Ecosystem Contract Model
import mongoose, { Schema } from 'mongoose';
import { IContractDB } from '../interfaces/contract.interface';
import { ContractServiceOffering } from '../interfaces/schemas.interface';

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
    rightOperand: mongoose.Schema.Types.Mixed,
  },
  { _id: false },
);
const UnknownConstraintSchema = new Schema(
  { '@type': String },
  { strict: false, _id: false },
);
//
const PolicySchema = new Schema(
  {
    uid: String,
    description: String,
    permission: [
      {
        action: String,
        target: String,
        constraint: [DefaultConstraintSchema, UnknownConstraintSchema],
        _id: false,
      },
    ],
    prohibition: [
      {
        action: String,
        target: String,
        constraint: [DefaultConstraintSchema, UnknownConstraintSchema],
        _id: false,
      },
    ],
  },
  { _id: false },
);
const OfferingSchema = new Schema({
  participant: { type: String, required: true },
  serviceOffering: { type: String, required: true },
  policies: [PolicySchema],
});

// Member signature mongoose schema
const MemberSchema = new Schema(
  {
    participant: { type: String, required: true },
    role: { type: String, required: true },
    signature: { type: String, required: true },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);
/*
const DataProcessingSchema = new Schema(
  {
    connectorURI: { type: String, required: true },
    services: { type: [String], required: true },
  },
  { _id: false, timestamps: true },
);
*/
// Contract mongoose schema
const ContractSchema: Schema = new Schema(
  {
    uid: String,
    profile: String,
    ecosystem: String,
    orchestrator: String,
    serviceOfferings: [OfferingSchema],
    rolesAndObligations: [{ role: String, policies: [PolicySchema] }],
    dataProcessings: { type: [String], default: [] },
    purpose: [PurposeSchema],
    members: [MemberSchema],
    revokedMembers: [MemberSchema],
    status: {
      type: String,
      enum: ['signed', 'revoked', 'pending'],
      default: 'pending',
    },
    jsonLD: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
// Create a MongoDB model based on the schema
export default mongoose.model<IContractDB>('Contract', ContractSchema);
