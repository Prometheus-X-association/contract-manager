import { ContractDocument, Contract } from './schemas.interface';

/*
interface Constraint {
  '@type': string;
  leftOperand?: string;
  operator?: string;
  rightOperand?: string;
}
interface UnknownConstraint {
  '@type': string;
}
interface Permission {
  '@type': string;
  target?: string;
  assigner?: string;
  assignee?: string;
  action?: string;
  data?: string;
  constraint?: Constraint | UnknownConstraint;
}
interface Data {
  uid: string;
  type: string;
  purpose: string;
}
interface Purpose {
  uid: string;
  purpose: string;
  action: string;
  assigner: string;
  assignee: string;
  purposeCategory: string;
  consentType: string;
  piiCategory: string;
  primaryPurpose: string;
  termination: string;
  thirdPartyDisclosure: string;
  thirdPartyName: string;
}
interface Policy {
  policyText?: string;
  profile?: string;
  identifier?: string;
  startDate?: string;
  endDate?: string;
}
interface SpiCategory {
  // Add necessary properties here
}
export interface IContract {
  '@context': string;
  '@type': string;
  '@id': string;
  uri?: string;
  uid?: string;
  profile?: string;
  permission?: Permission[];
  data?: Data[];
  purpose?: Purpose[];
  signatures?: Signature[];
  createdAt?: Date;
  // policyUrl: string;
  policy?: Policy;
  spiCat?: SpiCategory;
}
interface Signature {
  party: string;
  value: string;
}
*/

// Interface for the generated ODRL contract
export type IContractDB = ContractDocument;
// Type used for Contract data manipulation within the API
export type IContract = Contract;
