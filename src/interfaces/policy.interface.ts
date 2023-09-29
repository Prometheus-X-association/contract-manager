import {
  PolicyReferenceRegistryPolicie,
  PolicyReferenceRegistryPolicieDocument,
} from './schemas.interface';

export interface IPolicy extends Document {
  // Tmp fields
  name: string;
  description: string;
}

export type PDPAction = 'write' | 'POST' | 'GET' | 'PUT' | 'DELETE';
//
export interface IAuthorisationPolicy extends PolicyReferenceRegistryPolicie {
  action: PDPAction;
  conditions: Record<string, unknown>;
  fields?: [];
}
//
export type IAuthorisationPolicyDB = PolicyReferenceRegistryPolicieDocument;
