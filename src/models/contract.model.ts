import mongoose, { Query, Schema } from 'mongoose';
import { IContractDB } from '../interfaces/contract.interface';
import { ContractAgentService } from '../services/contract.agent.service';
import { config } from '../config/config';

// Ecosystem Contract Model / Dataspace User Case
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

const ConstraintSchema = new Schema(
  {
    '@type': String,
    leftOperand: String,
    operator: String,
    rightOperand: mongoose.Schema.Types.Mixed,
  },
  { strict: false, _id: false },
);

const ConsequenceSchema = new Schema(
  {
    action: String,
    constraint: [ConstraintSchema],
    consequence: [this],
  },
  { _id: false },
);
const DutySchema = new Schema(
  {
    action: String,
    constraint: [ConstraintSchema],
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
        constraint: [ConstraintSchema],
        _id: false,
      },
    ],
    prohibition: [
      {
        action: String,
        target: String,
        constraint: [ConstraintSchema],
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

const InfrastructureServiceSchema = new Schema({
  participant: { type: String, required: true },
  serviceOffering: { type: String, required: true },
});

const DataProcessingSchema = new Schema({
  catalogId: { type: String, required: true },
  infrastructureServices: { type: [InfrastructureServiceSchema], default: [] },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
});

const ContractSchema: Schema = new Schema(
  {
    uid: String,
    profile: String,
    ecosystem: String,
    orchestrator: String,
    serviceOfferings: [OfferingSchema],
    rolesAndObligations: [{ role: String, policies: [PolicySchema] }],
    dataProcessings: { type: [DataProcessingSchema], default: [] },
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

const initContractModel = async () => {
  const contractAgentService = await ContractAgentService.retrieveService();
  const contractCollection = contractAgentService.getCollection();
  const contractModel = mongoose.model<IContractDB>(
    'Contract',
    ContractSchema,
    // contractCollection.collectionName,
  );

  contractModel.prototype.save = async function () {
    const cleanObject = JSON.parse(JSON.stringify(this));
    const result = await contractCollection.insertOne(cleanObject);
    return { ...cleanObject, _id: result.insertedId };
  };

  contractModel.create = async function (doc) {
    const cleanDoc = JSON.parse(JSON.stringify(doc));
    const result = await contractCollection.insertOne(cleanDoc);
    return { ...cleanDoc, _id: result.insertedId };
  };

  contractModel.findByIdAndUpdate = function (id, update, options = {}) {
    const cleanUpdate = JSON.parse(JSON.stringify(update));
    return contractCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: cleanUpdate },
      options,
    );
  };

  contractModel.updateMany = function (filter, update, options = {}) {
    const cleanFilter = JSON.parse(JSON.stringify(filter));
    const cleanUpdate = JSON.parse(JSON.stringify(update));
    return contractCollection.updateMany(
      cleanFilter,
      { $set: cleanUpdate },
      options,
    );
  };

  contractModel.findByIdAndDelete = function (
    id: string | mongoose.Types.ObjectId,
  ) {
    return {
      select(): any {
        return this;
      },
      async exec(): Promise<any> {
        return contractCollection.findOneAndDelete({
          _id: new mongoose.Types.ObjectId(id),
        });
      },
    } as unknown as Query<any, any>;
  };

  contractModel.deleteMany = function (filter) {
    const operation = contractCollection.deleteMany(
      JSON.parse(JSON.stringify(filter)),
    );
    return {
      select(): any {
        return this;
      },
      exec(): Promise<any> {
        return operation;
      },
    } as unknown as Query<any, any>;
  };

  contractModel.findOneAndUpdate = function (
    filter: any,
    update: any,
    options: any = {},
  ) {
    return {} as any;
  };

  contractModel.updateOne = function (
    filter: any,
    update: any,
    options: any = {},
  ) {
    return {} as any;
  };
  // contractModel.collection = contractCollection;
  return contractModel;
};

export default {
  getModel: async (): Promise<mongoose.Model<IContractDB>> => {
    return config.useContractAgent
      ? await initContractModel()
      : mongoose.model<IContractDB>('Contract', ContractSchema);
  },
};

// export default mongoose.model<IContractDB>('Contract', ContractSchema);
