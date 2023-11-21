import {
  ContractRolesAndObligationPolicie,
  Policy,
  PolicyDocument,
  PolicyReferenceRegistryPolicie,
  PolicyReferenceRegistryPolicieDocument,
} from './schemas.interface';

export type IPolicy = Policy;
export type IPolicyDB = PolicyDocument;
export type PDPAction = 'write' | 'POST' | 'GET' | 'PUT' | 'DELETE';
export type ICondition = Record<string, unknown>;
export type IContractPolicy = ContractRolesAndObligationPolicie;

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

export interface IPolicyInjection {
  role?: String;
  ruleId: string;
  values: any;
}

export type IAuthorisationPolicyDB = PolicyReferenceRegistryPolicieDocument;
