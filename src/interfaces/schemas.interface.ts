/* tslint:disable */
/* eslint-disable */

// ######################################## THIS FILE WAS GENERATED BY MONGOOSE-TSGEN ######################################## //

// NOTE: ANY CHANGES MADE WILL BE OVERWRITTEN ON SUBSEQUENT EXECUTIONS OF MONGOOSE-TSGEN.

import mongoose from 'mongoose';

/**
 * Lean version of BilateralContractPermissionConstraintDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `BilateralContractPermissionDocument.toObject()`.
 * ```
 * const bilateralcontractpermissionObject = bilateralcontractpermission.toObject();
 * ```
 */
export type BilateralContractPermissionConstraint = {
  '@type'?: string;
  leftOperand?: string;
  operator?: string;
  rightOperand?: any;
};

/**
 * Lean version of BilateralContractPermissionDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `BilateralContractDocument.toObject()`.
 * ```
 * const bilateralcontractObject = bilateralcontract.toObject();
 * ```
 */
export type BilateralContractPermission = {
  action?: string;
  target?: string;
  constraint: BilateralContractPermissionConstraint[];
  _id: mongoose.Types.ObjectId;
};

/**
 * Lean version of BilateralContractProhibitionConstraintDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `BilateralContractProhibitionDocument.toObject()`.
 * ```
 * const bilateralcontractprohibitionObject = bilateralcontractprohibition.toObject();
 * ```
 */
export type BilateralContractProhibitionConstraint = {
  '@type'?: string;
  leftOperand?: string;
  operator?: string;
  rightOperand?: any;
};

/**
 * Lean version of BilateralContractProhibitionDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `BilateralContractDocument.toObject()`.
 * ```
 * const bilateralcontractObject = bilateralcontract.toObject();
 * ```
 */
export type BilateralContractProhibition = {
  action?: string;
  target?: string;
  constraint: BilateralContractProhibitionConstraint[];
  _id: mongoose.Types.ObjectId;
};

/**
 * Lean version of BilateralContractPurposeDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `BilateralContractDocument.toObject()`.
 * ```
 * const bilateralcontractObject = bilateralcontract.toObject();
 * ```
 */
export type BilateralContractPurpose = {
  uid?: string;
  purpose?: string;
  action?: string;
  assigner?: string;
  assignee?: string;
  purposeCategory?: string;
  consentType?: string;
  piiCategory?: string;
  primaryPurpose?: string;
  termination?: string;
  thirdPartyDisclosure?: string;
  thirdPartyName?: string;
  _id: mongoose.Types.ObjectId;
};

/**
 * Lean version of BilateralContractSignatureDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `BilateralContractDocument.toObject()`.
 * ```
 * const bilateralcontractObject = bilateralcontract.toObject();
 * ```
 */
export type BilateralContractSignature = {
  did: string;
  party: string;
  value: string;
  date?: Date;
};

/**
 * Lean version of BilateralContractRevokedSignatureDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `BilateralContractDocument.toObject()`.
 * ```
 * const bilateralcontractObject = bilateralcontract.toObject();
 * ```
 */
export type BilateralContractRevokedSignature = {
  did: string;
  party: string;
  value: string;
  date?: Date;
};

/**
 * Lean version of BilateralContractNegotiatorDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `BilateralContractDocument.toObject()`.
 * ```
 * const bilateralcontractObject = bilateralcontract.toObject();
 * ```
 */
export type BilateralContractNegotiator = {
  did?: string;
  _id: mongoose.Types.ObjectId;
};

/**
 * Lean version of BilateralContractDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `BilateralContractDocument.toObject()`. To avoid conflicts with model names, use the type alias `BilateralContractObject`.
 * ```
 * const bilateralcontractObject = bilateralcontract.toObject();
 * ```
 */
export type BilateralContract = {
  uid?: string;
  profile?: string;
  permission: BilateralContractPermission[];
  prohibition: BilateralContractProhibition[];
  purpose: BilateralContractPurpose[];
  signatures: BilateralContractRevokedSignature[];
  revokedSignatures: BilateralContractRevokedSignature[];
  negotiators: BilateralContractNegotiator[];
  createdAt?: Date;
  status?: 'signed' | 'revoked' | 'under_negotiation' | 'pending';
  jsonLD?: string;
  _id: mongoose.Types.ObjectId;
};

/**
 * Lean version of BilateralContractDocument (type alias of `BilateralContract`)
 *
 * Use this type alias to avoid conflicts with model names:
 * ```
 * import { BilateralContract } from "../models"
 * import { BilateralContractObject } from "../interfaces/mongoose.gen.ts"
 *
 * const bilateralcontractObject: BilateralContractObject = bilateralcontract.toObject();
 * ```
 */
export type BilateralContractObject = BilateralContract;

/**
 * Mongoose Query type
 *
 * This type is returned from query functions. For most use cases, you should not need to use this type explicitly.
 */
export type BilateralContractQuery = mongoose.Query<
  any,
  BilateralContractDocument,
  BilateralContractQueries
> &
  BilateralContractQueries;

/**
 * Mongoose Query helper types
 *
 * This type represents `BilateralContractSchema.query`. For most use cases, you should not need to use this type explicitly.
 */
export type BilateralContractQueries = {};

export type BilateralContractMethods = {};

export type BilateralContractStatics = {};

/**
 * Mongoose Model type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const BilateralContract = mongoose.model<BilateralContractDocument, BilateralContractModel>("BilateralContract", BilateralContractSchema);
 * ```
 */
export type BilateralContractModel = mongoose.Model<
  BilateralContractDocument,
  BilateralContractQueries
> &
  BilateralContractStatics;

/**
 * Mongoose Schema type
 *
 * Assign this type to new BilateralContract schema instances:
 * ```
 * const BilateralContractSchema: BilateralContractSchema = new mongoose.Schema({ ... })
 * ```
 */
export type BilateralContractSchema = mongoose.Schema<
  BilateralContractDocument,
  BilateralContractModel,
  BilateralContractMethods,
  BilateralContractQueries
>;

/**
 * Mongoose Subdocument type
 *
 * Type of `BilateralContractPermissionDocument["constraint"]` element.
 */
export type BilateralContractPermissionConstraintDocument =
  mongoose.Types.Subdocument & {
    '@type'?: string;
    leftOperand?: string;
    operator?: string;
    rightOperand?: any;
  };

/**
 * Mongoose Subdocument type
 *
 * Type of `BilateralContractDocument["permission"]` element.
 */
export type BilateralContractPermissionDocument = mongoose.Types.Subdocument & {
  action?: string;
  target?: string;
  constraint: mongoose.Types.DocumentArray<BilateralContractPermissionConstraintDocument>;
  _id: mongoose.Types.ObjectId;
};

/**
 * Mongoose Subdocument type
 *
 * Type of `BilateralContractProhibitionDocument["constraint"]` element.
 */
export type BilateralContractProhibitionConstraintDocument =
  mongoose.Types.Subdocument & {
    '@type'?: string;
    leftOperand?: string;
    operator?: string;
    rightOperand?: any;
  };

/**
 * Mongoose Subdocument type
 *
 * Type of `BilateralContractDocument["prohibition"]` element.
 */
export type BilateralContractProhibitionDocument =
  mongoose.Types.Subdocument & {
    action?: string;
    target?: string;
    constraint: mongoose.Types.DocumentArray<BilateralContractProhibitionConstraintDocument>;
    _id: mongoose.Types.ObjectId;
  };

/**
 * Mongoose Subdocument type
 *
 * Type of `BilateralContractDocument["purpose"]` element.
 */
export type BilateralContractPurposeDocument = mongoose.Types.Subdocument & {
  uid?: string;
  purpose?: string;
  action?: string;
  assigner?: string;
  assignee?: string;
  purposeCategory?: string;
  consentType?: string;
  piiCategory?: string;
  primaryPurpose?: string;
  termination?: string;
  thirdPartyDisclosure?: string;
  thirdPartyName?: string;
  _id: mongoose.Types.ObjectId;
};

/**
 * Mongoose Subdocument type
 *
 * Type of `BilateralContractDocument["signatures"]` element.
 */
export type BilateralContractSignatureDocument = mongoose.Types.Subdocument & {
  did: string;
  party: string;
  value: string;
  date?: Date;
};

/**
 * Mongoose Subdocument type
 *
 * Type of `BilateralContractDocument["revokedSignatures"]` element.
 */
export type BilateralContractRevokedSignatureDocument =
  mongoose.Types.Subdocument & {
    did: string;
    party: string;
    value: string;
    date?: Date;
  };

/**
 * Mongoose Subdocument type
 *
 * Type of `BilateralContractDocument["negotiators"]` element.
 */
export type BilateralContractNegotiatorDocument = mongoose.Types.Subdocument & {
  did?: string;
  _id: mongoose.Types.ObjectId;
};

/**
 * Mongoose Document type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const BilateralContract = mongoose.model<BilateralContractDocument, BilateralContractModel>("BilateralContract", BilateralContractSchema);
 * ```
 */
export type BilateralContractDocument = mongoose.Document<
  mongoose.Types.ObjectId,
  BilateralContractQueries
> &
  BilateralContractMethods & {
    uid?: string;
    profile?: string;
    permission: mongoose.Types.DocumentArray<BilateralContractPermissionDocument>;
    prohibition: mongoose.Types.DocumentArray<BilateralContractProhibitionDocument>;
    purpose: mongoose.Types.DocumentArray<BilateralContractPurposeDocument>;
    signatures: mongoose.Types.DocumentArray<BilateralContractRevokedSignatureDocument>;
    revokedSignatures: mongoose.Types.DocumentArray<BilateralContractRevokedSignatureDocument>;
    negotiators: mongoose.Types.DocumentArray<BilateralContractNegotiatorDocument>;
    createdAt?: Date;
    status?: 'signed' | 'revoked' | 'under_negotiation' | 'pending';
    jsonLD?: string;
    _id: mongoose.Types.ObjectId;
  };

/**
 * Lean version of ContractRolesAndObligationPolicyPermissionConstraintDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `ContractRolesAndObligationPolicyPermissionDocument.toObject()`.
 * ```
 * const contractrolesandobligationpolicypermissionObject = contractrolesandobligationpolicypermission.toObject();
 * ```
 */
export type ContractRolesAndObligationPolicyPermissionConstraint = {
  '@type'?: string;
  leftOperand?: string;
  operator?: string;
  rightOperand?: any;
};

/**
 * Lean version of ContractRolesAndObligationPolicyPermissionDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `ContractRolesAndObligationPolicyDocument.toObject()`.
 * ```
 * const contractrolesandobligationpolicyObject = contractrolesandobligationpolicy.toObject();
 * ```
 */
export type ContractRolesAndObligationPolicyPermission = {
  action?: string;
  target?: string;
  constraint: ContractRolesAndObligationPolicyPermissionConstraint[];
};

/**
 * Lean version of ContractRolesAndObligationPolicyProhibitionConstraintDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `ContractRolesAndObligationPolicyProhibitionDocument.toObject()`.
 * ```
 * const contractrolesandobligationpolicyprohibitionObject = contractrolesandobligationpolicyprohibition.toObject();
 * ```
 */
export type ContractRolesAndObligationPolicyProhibitionConstraint = {
  '@type'?: string;
  leftOperand?: string;
  operator?: string;
  rightOperand?: any;
};

/**
 * Lean version of ContractRolesAndObligationPolicyProhibitionDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `ContractRolesAndObligationPolicyDocument.toObject()`.
 * ```
 * const contractrolesandobligationpolicyObject = contractrolesandobligationpolicy.toObject();
 * ```
 */
export type ContractRolesAndObligationPolicyProhibition = {
  action?: string;
  target?: string;
  constraint: ContractRolesAndObligationPolicyProhibitionConstraint[];
};

/**
 * Lean version of ContractRolesAndObligationPolicyDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `ContractRolesAndObligationDocument.toObject()`.
 * ```
 * const contractrolesandobligationObject = contractrolesandobligation.toObject();
 * ```
 */
export type ContractRolesAndObligationPolicy = {
  permission: ContractRolesAndObligationPolicyPermission[];
  prohibition: ContractRolesAndObligationPolicyProhibition[];
};

/**
 * Lean version of ContractRolesAndObligationDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `ContractDocument.toObject()`.
 * ```
 * const contractObject = contract.toObject();
 * ```
 */
export type ContractRolesAndObligation = {
  role?: string;
  policy?: ContractRolesAndObligationPolicy;
  _id: mongoose.Types.ObjectId;
};

/**
 * Lean version of ContractPolicyPermissionConstraintDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `ContractPolicyPermissionDocument.toObject()`.
 * ```
 * const contractpolicypermissionObject = contractpolicypermission.toObject();
 * ```
 */
export type ContractPolicyPermissionConstraint = {
  '@type'?: string;
  leftOperand?: string;
  operator?: string;
  rightOperand?: any;
};

/**
 * Lean version of ContractPolicyPermissionDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `ContractPolicyDocument.toObject()`.
 * ```
 * const contractpolicyObject = contractpolicy.toObject();
 * ```
 */
export type ContractPolicyPermission = {
  action?: string;
  target?: string;
  constraint: ContractPolicyPermissionConstraint[];
};

/**
 * Lean version of ContractPolicyProhibitionConstraintDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `ContractPolicyProhibitionDocument.toObject()`.
 * ```
 * const contractpolicyprohibitionObject = contractpolicyprohibition.toObject();
 * ```
 */
export type ContractPolicyProhibitionConstraint = {
  '@type'?: string;
  leftOperand?: string;
  operator?: string;
  rightOperand?: any;
};

/**
 * Lean version of ContractPolicyProhibitionDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `ContractPolicyDocument.toObject()`.
 * ```
 * const contractpolicyObject = contractpolicy.toObject();
 * ```
 */
export type ContractPolicyProhibition = {
  action?: string;
  target?: string;
  constraint: ContractPolicyProhibitionConstraint[];
};

/**
 * Lean version of ContractPolicyDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `ContractDocument.toObject()`.
 * ```
 * const contractObject = contract.toObject();
 * ```
 */
export type ContractPolicy = {
  permission: ContractPolicyPermission[];
  prohibition: ContractPolicyProhibition[];
};

/**
 * Lean version of ContractPurposeDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `ContractDocument.toObject()`.
 * ```
 * const contractObject = contract.toObject();
 * ```
 */
export type ContractPurpose = {
  uid?: string;
  purpose?: string;
  action?: string;
  assigner?: string;
  assignee?: string;
  purposeCategory?: string;
  consentType?: string;
  piiCategory?: string;
  primaryPurpose?: string;
  termination?: string;
  thirdPartyDisclosure?: string;
  thirdPartyName?: string;
  _id: mongoose.Types.ObjectId;
};

/**
 * Lean version of ContractMemberDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `ContractDocument.toObject()`.
 * ```
 * const contractObject = contract.toObject();
 * ```
 */
export type ContractMember = {
  participant: string;
  role: string;
  signature: string;
  date?: Date;
};

/**
 * Lean version of ContractRevokedMemberDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `ContractDocument.toObject()`.
 * ```
 * const contractObject = contract.toObject();
 * ```
 */
export type ContractRevokedMember = {
  participant: string;
  role: string;
  signature: string;
  date?: Date;
};

/**
 * Lean version of ContractDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `ContractDocument.toObject()`. To avoid conflicts with model names, use the type alias `ContractObject`.
 * ```
 * const contractObject = contract.toObject();
 * ```
 */
export type Contract = {
  uid?: string;
  profile?: string;
  ecosystem?: string;
  orchestrator?: string;
  rolesAndObligations: ContractRolesAndObligation[];
  policy?: ContractPolicy;
  purpose: ContractPurpose[];
  members: ContractRevokedMember[];
  revokedMembers: ContractRevokedMember[];
  status?: 'signed' | 'revoked' | 'pending';
  createdAt?: Date;
  jsonLD?: string;
  _id: mongoose.Types.ObjectId;
};

/**
 * Lean version of ContractDocument (type alias of `Contract`)
 *
 * Use this type alias to avoid conflicts with model names:
 * ```
 * import { Contract } from "../models"
 * import { ContractObject } from "../interfaces/mongoose.gen.ts"
 *
 * const contractObject: ContractObject = contract.toObject();
 * ```
 */
export type ContractObject = Contract;

/**
 * Mongoose Query type
 *
 * This type is returned from query functions. For most use cases, you should not need to use this type explicitly.
 */
export type ContractQuery = mongoose.Query<
  any,
  ContractDocument,
  ContractQueries
> &
  ContractQueries;

/**
 * Mongoose Query helper types
 *
 * This type represents `ContractSchema.query`. For most use cases, you should not need to use this type explicitly.
 */
export type ContractQueries = {};

export type ContractMethods = {};

export type ContractStatics = {};

/**
 * Mongoose Model type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const Contract = mongoose.model<ContractDocument, ContractModel>("Contract", ContractSchema);
 * ```
 */
export type ContractModel = mongoose.Model<ContractDocument, ContractQueries> &
  ContractStatics;

/**
 * Mongoose Schema type
 *
 * Assign this type to new Contract schema instances:
 * ```
 * const ContractSchema: ContractSchema = new mongoose.Schema({ ... })
 * ```
 */
export type ContractSchema = mongoose.Schema<
  ContractDocument,
  ContractModel,
  ContractMethods,
  ContractQueries
>;

/**
 * Mongoose Subdocument type
 *
 * Type of `ContractRolesAndObligationPolicyPermissionDocument["constraint"]` element.
 */
export type ContractRolesAndObligationPolicyPermissionConstraintDocument =
  mongoose.Types.Subdocument & {
    '@type'?: string;
    leftOperand?: string;
    operator?: string;
    rightOperand?: any;
  };

/**
 * Mongoose Subdocument type
 *
 * Type of `ContractRolesAndObligationPolicyDocument["permission"]` element.
 */
export type ContractRolesAndObligationPolicyPermissionDocument =
  mongoose.Types.Subdocument & {
    action?: string;
    target?: string;
    constraint: mongoose.Types.DocumentArray<ContractRolesAndObligationPolicyPermissionConstraintDocument>;
  };

/**
 * Mongoose Subdocument type
 *
 * Type of `ContractRolesAndObligationPolicyProhibitionDocument["constraint"]` element.
 */
export type ContractRolesAndObligationPolicyProhibitionConstraintDocument =
  mongoose.Types.Subdocument & {
    '@type'?: string;
    leftOperand?: string;
    operator?: string;
    rightOperand?: any;
  };

/**
 * Mongoose Subdocument type
 *
 * Type of `ContractRolesAndObligationPolicyDocument["prohibition"]` element.
 */
export type ContractRolesAndObligationPolicyProhibitionDocument =
  mongoose.Types.Subdocument & {
    action?: string;
    target?: string;
    constraint: mongoose.Types.DocumentArray<ContractRolesAndObligationPolicyProhibitionConstraintDocument>;
  };

/**
 * Mongoose Document type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const ContractRolesAndObligation = mongoose.model<ContractRolesAndObligationDocument, ContractRolesAndObligationModel>("ContractRolesAndObligation", ContractRolesAndObligationSchema);
 * ```
 */
export type ContractRolesAndObligationPolicyDocument =
  mongoose.Document<mongoose.Types.ObjectId> & {
    permission: mongoose.Types.DocumentArray<ContractRolesAndObligationPolicyPermissionDocument>;
    prohibition: mongoose.Types.DocumentArray<ContractRolesAndObligationPolicyProhibitionDocument>;
  };

/**
 * Mongoose Subdocument type
 *
 * Type of `ContractDocument["rolesAndObligations"]` element.
 */
export type ContractRolesAndObligationDocument = mongoose.Types.Subdocument & {
  role?: string;
  policy?: ContractRolesAndObligationPolicyDocument;
  _id: mongoose.Types.ObjectId;
};

/**
 * Mongoose Subdocument type
 *
 * Type of `ContractPolicyPermissionDocument["constraint"]` element.
 */
export type ContractPolicyPermissionConstraintDocument =
  mongoose.Types.Subdocument & {
    '@type'?: string;
    leftOperand?: string;
    operator?: string;
    rightOperand?: any;
  };

/**
 * Mongoose Subdocument type
 *
 * Type of `ContractPolicyDocument["permission"]` element.
 */
export type ContractPolicyPermissionDocument = mongoose.Types.Subdocument & {
  action?: string;
  target?: string;
  constraint: mongoose.Types.DocumentArray<ContractPolicyPermissionConstraintDocument>;
};

/**
 * Mongoose Subdocument type
 *
 * Type of `ContractPolicyProhibitionDocument["constraint"]` element.
 */
export type ContractPolicyProhibitionConstraintDocument =
  mongoose.Types.Subdocument & {
    '@type'?: string;
    leftOperand?: string;
    operator?: string;
    rightOperand?: any;
  };

/**
 * Mongoose Subdocument type
 *
 * Type of `ContractPolicyDocument["prohibition"]` element.
 */
export type ContractPolicyProhibitionDocument = mongoose.Types.Subdocument & {
  action?: string;
  target?: string;
  constraint: mongoose.Types.DocumentArray<ContractPolicyProhibitionConstraintDocument>;
};

/**
 * Mongoose Document type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const Contract = mongoose.model<ContractDocument, ContractModel>("Contract", ContractSchema);
 * ```
 */
export type ContractPolicyDocument =
  mongoose.Document<mongoose.Types.ObjectId> & {
    permission: mongoose.Types.DocumentArray<ContractPolicyPermissionDocument>;
    prohibition: mongoose.Types.DocumentArray<ContractPolicyProhibitionDocument>;
  };

/**
 * Mongoose Subdocument type
 *
 * Type of `ContractDocument["purpose"]` element.
 */
export type ContractPurposeDocument = mongoose.Types.Subdocument & {
  uid?: string;
  purpose?: string;
  action?: string;
  assigner?: string;
  assignee?: string;
  purposeCategory?: string;
  consentType?: string;
  piiCategory?: string;
  primaryPurpose?: string;
  termination?: string;
  thirdPartyDisclosure?: string;
  thirdPartyName?: string;
  _id: mongoose.Types.ObjectId;
};

/**
 * Mongoose Subdocument type
 *
 * Type of `ContractDocument["members"]` element.
 */
export type ContractMemberDocument = mongoose.Types.Subdocument & {
  participant: string;
  role: string;
  signature: string;
  date?: Date;
};

/**
 * Mongoose Subdocument type
 *
 * Type of `ContractDocument["revokedMembers"]` element.
 */
export type ContractRevokedMemberDocument = mongoose.Types.Subdocument & {
  participant: string;
  role: string;
  signature: string;
  date?: Date;
};

/**
 * Mongoose Document type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const Contract = mongoose.model<ContractDocument, ContractModel>("Contract", ContractSchema);
 * ```
 */
export type ContractDocument = mongoose.Document<
  mongoose.Types.ObjectId,
  ContractQueries
> &
  ContractMethods & {
    uid?: string;
    profile?: string;
    ecosystem?: string;
    orchestrator?: string;
    rolesAndObligations: mongoose.Types.DocumentArray<ContractRolesAndObligationDocument>;
    policy?: ContractPolicyDocument;
    purpose: mongoose.Types.DocumentArray<ContractPurposeDocument>;
    members: mongoose.Types.DocumentArray<ContractRevokedMemberDocument>;
    revokedMembers: mongoose.Types.DocumentArray<ContractRevokedMemberDocument>;
    status?: 'signed' | 'revoked' | 'pending';
    createdAt?: Date;
    jsonLD?: string;
    _id: mongoose.Types.ObjectId;
  };

/**
 * Lean version of DataRegistryContractDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `DataRegistryDocument.toObject()`.
 * ```
 * const dataregistryObject = dataregistry.toObject();
 * ```
 */
export type DataRegistryContract = {
  bilateral?: string;
  ecosystem?: string;
};

/**
 * Lean version of DataRegistryPolicieDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `DataRegistryDocument.toObject()`.
 * ```
 * const dataregistryObject = dataregistry.toObject();
 * ```
 */
export type DataRegistryPolicie = {
  odrlValidationSchema?: string;
};

/**
 * Lean version of DataRegistryDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `DataRegistryDocument.toObject()`. To avoid conflicts with model names, use the type alias `DataRegistryObject`.
 * ```
 * const dataregistryObject = dataregistry.toObject();
 * ```
 */
export type DataRegistry = {
  contracts?: DataRegistryContract;
  policies?: DataRegistryPolicie;
  _id: mongoose.Types.ObjectId;
};

/**
 * Lean version of DataRegistryDocument (type alias of `DataRegistry`)
 *
 * Use this type alias to avoid conflicts with model names:
 * ```
 * import { DataRegistry } from "../models"
 * import { DataRegistryObject } from "../interfaces/mongoose.gen.ts"
 *
 * const dataregistryObject: DataRegistryObject = dataregistry.toObject();
 * ```
 */
export type DataRegistryObject = DataRegistry;

/**
 * Mongoose Query type
 *
 * This type is returned from query functions. For most use cases, you should not need to use this type explicitly.
 */
export type DataRegistryQuery = mongoose.Query<
  any,
  DataRegistryDocument,
  DataRegistryQueries
> &
  DataRegistryQueries;

/**
 * Mongoose Query helper types
 *
 * This type represents `DataRegistrySchema.query`. For most use cases, you should not need to use this type explicitly.
 */
export type DataRegistryQueries = {};

export type DataRegistryMethods = {};

export type DataRegistryStatics = {};

/**
 * Mongoose Model type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const DataRegistry = mongoose.model<DataRegistryDocument, DataRegistryModel>("DataRegistry", DataRegistrySchema);
 * ```
 */
export type DataRegistryModel = mongoose.Model<
  DataRegistryDocument,
  DataRegistryQueries
> &
  DataRegistryStatics;

/**
 * Mongoose Schema type
 *
 * Assign this type to new DataRegistry schema instances:
 * ```
 * const DataRegistrySchema: DataRegistrySchema = new mongoose.Schema({ ... })
 * ```
 */
export type DataRegistrySchema = mongoose.Schema<
  DataRegistryDocument,
  DataRegistryModel,
  DataRegistryMethods,
  DataRegistryQueries
>;

/**
 * Mongoose Document type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const DataRegistry = mongoose.model<DataRegistryDocument, DataRegistryModel>("DataRegistry", DataRegistrySchema);
 * ```
 */
export type DataRegistryContractDocument =
  mongoose.Document<mongoose.Types.ObjectId> & {
    bilateral?: string;
    ecosystem?: string;
  };

/**
 * Mongoose Document type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const DataRegistry = mongoose.model<DataRegistryDocument, DataRegistryModel>("DataRegistry", DataRegistrySchema);
 * ```
 */
export type DataRegistryPolicieDocument =
  mongoose.Document<mongoose.Types.ObjectId> & {
    odrlValidationSchema?: string;
  };

/**
 * Mongoose Document type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const DataRegistry = mongoose.model<DataRegistryDocument, DataRegistryModel>("DataRegistry", DataRegistrySchema);
 * ```
 */
export type DataRegistryDocument = mongoose.Document<
  mongoose.Types.ObjectId,
  DataRegistryQueries
> &
  DataRegistryMethods & {
    contracts?: DataRegistryContractDocument;
    policies?: DataRegistryPolicieDocument;
    _id: mongoose.Types.ObjectId;
  };

/**
 * Lean version of PolicyDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `PolicyDocument.toObject()`. To avoid conflicts with model names, use the type alias `PolicyObject`.
 * ```
 * const policyObject = policy.toObject();
 * ```
 */
export type Policy = {
  name: string;
  description: string;
  requestedFields: string[];
  jsonLD: string;
  _id: mongoose.Types.ObjectId;
};

/**
 * Lean version of PolicyDocument (type alias of `Policy`)
 *
 * Use this type alias to avoid conflicts with model names:
 * ```
 * import { Policy } from "../models"
 * import { PolicyObject } from "../interfaces/mongoose.gen.ts"
 *
 * const policyObject: PolicyObject = policy.toObject();
 * ```
 */
export type PolicyObject = Policy;

/**
 * Mongoose Query type
 *
 * This type is returned from query functions. For most use cases, you should not need to use this type explicitly.
 */
export type PolicyQuery = mongoose.Query<any, PolicyDocument, PolicyQueries> &
  PolicyQueries;

/**
 * Mongoose Query helper types
 *
 * This type represents `PolicySchema.query`. For most use cases, you should not need to use this type explicitly.
 */
export type PolicyQueries = {};

export type PolicyMethods = {};

export type PolicyStatics = {};

/**
 * Mongoose Model type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const Policy = mongoose.model<PolicyDocument, PolicyModel>("Policy", PolicySchema);
 * ```
 */
export type PolicyModel = mongoose.Model<PolicyDocument, PolicyQueries> &
  PolicyStatics;

/**
 * Mongoose Schema type
 *
 * Assign this type to new Policy schema instances:
 * ```
 * const PolicySchema: PolicySchema = new mongoose.Schema({ ... })
 * ```
 */
export type PolicySchema = mongoose.Schema<
  PolicyDocument,
  PolicyModel,
  PolicyMethods,
  PolicyQueries
>;

/**
 * Mongoose Document type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const Policy = mongoose.model<PolicyDocument, PolicyModel>("Policy", PolicySchema);
 * ```
 */
export type PolicyDocument = mongoose.Document<
  mongoose.Types.ObjectId,
  PolicyQueries
> &
  PolicyMethods & {
    name: string;
    description: string;
    requestedFields: mongoose.Types.Array<string>;
    jsonLD: string;
    _id: mongoose.Types.ObjectId;
  };

/**
 * Lean version of PolicyReferenceRegistryPolicieDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `PolicyReferenceRegistryDocument.toObject()`.
 * ```
 * const policyreferenceregistryObject = policyreferenceregistry.toObject();
 * ```
 */
export type PolicyReferenceRegistryPolicie = {
  subject: string;
  action: string;
  conditions?: any;
};

/**
 * Lean version of PolicyReferenceRegistryDocument
 *
 * This has all Mongoose getters & functions removed. This type will be returned from `PolicyReferenceRegistryDocument.toObject()`. To avoid conflicts with model names, use the type alias `PolicyReferenceRegistryObject`.
 * ```
 * const policyreferenceregistryObject = policyreferenceregistry.toObject();
 * ```
 */
export type PolicyReferenceRegistry = {
  policies: PolicyReferenceRegistryPolicie[];
  _id: mongoose.Types.ObjectId;
};

/**
 * Lean version of PolicyReferenceRegistryDocument (type alias of `PolicyReferenceRegistry`)
 *
 * Use this type alias to avoid conflicts with model names:
 * ```
 * import { PolicyReferenceRegistry } from "../models"
 * import { PolicyReferenceRegistryObject } from "../interfaces/mongoose.gen.ts"
 *
 * const policyreferenceregistryObject: PolicyReferenceRegistryObject = policyreferenceregistry.toObject();
 * ```
 */
export type PolicyReferenceRegistryObject = PolicyReferenceRegistry;

/**
 * Mongoose Query type
 *
 * This type is returned from query functions. For most use cases, you should not need to use this type explicitly.
 */
export type PolicyReferenceRegistryQuery = mongoose.Query<
  any,
  PolicyReferenceRegistryDocument,
  PolicyReferenceRegistryQueries
> &
  PolicyReferenceRegistryQueries;

/**
 * Mongoose Query helper types
 *
 * This type represents `PolicyReferenceRegistrySchema.query`. For most use cases, you should not need to use this type explicitly.
 */
export type PolicyReferenceRegistryQueries = {};

export type PolicyReferenceRegistryMethods = {};

export type PolicyReferenceRegistryStatics = {};

/**
 * Mongoose Model type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const PolicyReferenceRegistry = mongoose.model<PolicyReferenceRegistryDocument, PolicyReferenceRegistryModel>("PolicyReferenceRegistry", PolicyReferenceRegistrySchema);
 * ```
 */
export type PolicyReferenceRegistryModel = mongoose.Model<
  PolicyReferenceRegistryDocument,
  PolicyReferenceRegistryQueries
> &
  PolicyReferenceRegistryStatics;

/**
 * Mongoose Schema type
 *
 * Assign this type to new PolicyReferenceRegistry schema instances:
 * ```
 * const PolicyReferenceRegistrySchema: PolicyReferenceRegistrySchema = new mongoose.Schema({ ... })
 * ```
 */
export type PolicyReferenceRegistrySchema = mongoose.Schema<
  PolicyReferenceRegistryDocument,
  PolicyReferenceRegistryModel,
  PolicyReferenceRegistryMethods,
  PolicyReferenceRegistryQueries
>;

/**
 * Mongoose Subdocument type
 *
 * Type of `PolicyReferenceRegistryDocument["policies"]` element.
 */
export type PolicyReferenceRegistryPolicieDocument =
  mongoose.Types.Subdocument & {
    subject: string;
    action: string;
    conditions?: any;
  };

/**
 * Mongoose Document type
 *
 * Pass this type to the Mongoose Model constructor:
 * ```
 * const PolicyReferenceRegistry = mongoose.model<PolicyReferenceRegistryDocument, PolicyReferenceRegistryModel>("PolicyReferenceRegistry", PolicyReferenceRegistrySchema);
 * ```
 */
export type PolicyReferenceRegistryDocument = mongoose.Document<
  mongoose.Types.ObjectId,
  PolicyReferenceRegistryQueries
> &
  PolicyReferenceRegistryMethods & {
    policies: mongoose.Types.DocumentArray<PolicyReferenceRegistryPolicieDocument>;
    _id: mongoose.Types.ObjectId;
  };

/**
 * Check if a property on a document is populated:
 * ```
 * import { IsPopulated } from "../interfaces/mongoose.gen.ts"
 *
 * if (IsPopulated<UserDocument["bestFriend"]>) { ... }
 * ```
 */
export function IsPopulated<T>(doc: T | mongoose.Types.ObjectId): doc is T {
  return doc instanceof mongoose.Document;
}

/**
 * Helper type used by `PopulatedDocument`. Returns the parent property of a string
 * representing a nested property (i.e. `friend.user` -> `friend`)
 */
type ParentProperty<T> = T extends `${infer P}.${string}` ? P : never;

/**
 * Helper type used by `PopulatedDocument`. Returns the child property of a string
 * representing a nested property (i.e. `friend.user` -> `user`).
 */
type ChildProperty<T> = T extends `${string}.${infer C}` ? C : never;

/**
 * Helper type used by `PopulatedDocument`. Removes the `ObjectId` from the general union type generated
 * for ref documents (i.e. `mongoose.Types.ObjectId | UserDocument` -> `UserDocument`)
 */
type PopulatedProperty<Root, T extends keyof Root> = Omit<Root, T> & {
  [ref in T]: Root[T] extends mongoose.Types.Array<infer U>
    ? mongoose.Types.Array<Exclude<U, mongoose.Types.ObjectId>>
    : Exclude<Root[T], mongoose.Types.ObjectId>;
};

/**
 * Populate properties on a document type:
 * ```
 * import { PopulatedDocument } from "../interfaces/mongoose.gen.ts"
 *
 * function example(user: PopulatedDocument<UserDocument, "bestFriend">) {
 *   console.log(user.bestFriend._id) // typescript knows this is populated
 * }
 * ```
 */
export type PopulatedDocument<DocType, T> = T extends keyof DocType
  ? PopulatedProperty<DocType, T>
  : ParentProperty<T> extends keyof DocType
  ? Omit<DocType, ParentProperty<T>> & {
      [ref in ParentProperty<T>]: DocType[ParentProperty<T>] extends mongoose.Types.Array<
        infer U
      >
        ? mongoose.Types.Array<
            ChildProperty<T> extends keyof U
              ? PopulatedProperty<U, ChildProperty<T>>
              : PopulatedDocument<U, ChildProperty<T>>
          >
        : ChildProperty<T> extends keyof DocType[ParentProperty<T>]
        ? PopulatedProperty<DocType[ParentProperty<T>], ChildProperty<T>>
        : PopulatedDocument<DocType[ParentProperty<T>], ChildProperty<T>>;
    }
  : DocType;

/**
 * Helper types used by the populate overloads
 */
type Unarray<T> = T extends Array<infer U> ? U : T;
type Modify<T, R> = Omit<T, keyof R> & R;

/**
 * Augment mongoose with Query.populate overloads
 */
declare module 'mongoose' {
  interface Query<ResultType, DocType, THelpers = {}> {
    populate<T extends string>(
      path: T,
      select?: string | any,
      model?: string | Model<any, THelpers>,
      match?: any
    ): Query<
      ResultType extends Array<DocType>
        ? Array<PopulatedDocument<Unarray<ResultType>, T>>
        : ResultType extends DocType
        ? PopulatedDocument<Unarray<ResultType>, T>
        : ResultType,
      DocType,
      THelpers
    > &
      THelpers;

    populate<T extends string>(
      options: Modify<PopulateOptions, { path: T }> | Array<PopulateOptions>
    ): Query<
      ResultType extends Array<DocType>
        ? Array<PopulatedDocument<Unarray<ResultType>, T>>
        : ResultType extends DocType
        ? PopulatedDocument<Unarray<ResultType>, T>
        : ResultType,
      DocType,
      THelpers
    > &
      THelpers;
  }
}
