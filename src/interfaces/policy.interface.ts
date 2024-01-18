import { ContractRolesAndObligationPolicie } from './schemas.interface';

export type PDPAction = 'write' | 'POST' | 'GET' | 'PUT' | 'DELETE';
export type ICondition = Record<string, unknown>;
export type IContractPolicy = ContractRolesAndObligationPolicie;

//
export interface IPolicySet {
  permission: unknown[] | undefined;
  prohibition: unknown[] | undefined;
}

export interface IPolicyInjection {
  role?: String;
  ruleId: string;
  values: any;
}
