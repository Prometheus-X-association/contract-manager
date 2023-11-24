import {
  ContractRolesAndObligationPolicie,
  Rule,
  RuleDocument,
  PolicyReferenceRegistryPolicie,
  PolicyReferenceRegistryPolicieDocument,
} from './schemas.interface';

export type IRule = Omit<Rule, '_id'>;
export type IRuleDB = RuleDocument;
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
