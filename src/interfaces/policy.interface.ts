import {
  Policy,
  PolicyDocument,
  PolicyReferenceRegistryPolicie,
  PolicyReferenceRegistryPolicieDocument,
} from './schemas.interface';

export type IPolicy = Policy;
export type IPolicyDB = PolicyDocument;

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
  permissions: IAuthorisationPolicy[];
  prohibitions: IAuthorisationPolicy[];
}

export interface IPolicySet {
  permission: unknown[] | undefined;
  prohibition: unknown[] | undefined;
}

export type IAuthorisationPolicyDB = PolicyReferenceRegistryPolicieDocument;
