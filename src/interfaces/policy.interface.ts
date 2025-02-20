import { ContractRolesAndObligationPolicy } from './schemas.interface';

export type PDPAction = 'write' | 'POST' | 'GET' | 'PUT' | 'DELETE';
export type ICondition = Record<string, unknown>;
export type IContractPolicy = ContractRolesAndObligationPolicy;

//
export interface IPolicySet {
  permission: unknown[] | undefined;
  prohibition: unknown[] | undefined;
}

export interface IPolicyInjection {
  role?: string;
  ruleId: string;
  values: any;
}
