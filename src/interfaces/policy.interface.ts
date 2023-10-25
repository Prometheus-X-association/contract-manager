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
export type ICondition = Record<string, unknown>;

export interface IAuthorisationPolicy extends PolicyReferenceRegistryPolicie {
  action: PDPAction;
  conditions: ICondition;
  fields?: [];
}
//
export interface IAuthorisationPolicySet {
  [actor: string]: {
    permissions: IAuthorisationPolicy[];
    prohibitions: IAuthorisationPolicy[];
  };
}

export interface IPolicySet {
  [actor: string]: {
    permission: unknown[] | undefined;
    prohibition: unknown[] | undefined;
  };
}

export type IAuthorisationPolicyDB = PolicyReferenceRegistryPolicieDocument;
