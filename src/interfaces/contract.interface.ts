// Interface for the generated contract
interface Constraint {}
interface Permission {
  '@type': string;
  target: string;
  assigner: string;
  assignee: string;
  action: string;
  data: string;
  constraint: Constraint;
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
  primaryPurpose: boolean;
  termination: string;
  thirdPartyDisclosure: boolean;
  thirdPartyName: string;
}
interface Policy {
  policyText?: string;
  profile?: string;
  identifier?: string;
  startDate?: string;
  endDate?: string;
} //
interface SpiCategory {}
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
  // policyUrl: string;
  policy?: Policy;
  spiCat?: SpiCategory;
}
// Type used for Contract data manipulation within the API
export type IContractDB = IContract &
  Document & {
    createdAt: Date;
    // tmp field
    updated: boolean;
    signedByOrchestrator: boolean;
    signedByParticipant: boolean;
  };
