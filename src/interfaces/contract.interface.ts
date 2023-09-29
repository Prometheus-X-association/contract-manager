import {
  ContractDocument,
  Contract,
  BilateralContractDocument,
  BilateralContract,
} from './schemas.interface';

// Type for the generated mongoose contract
export type IContractDB = ContractDocument;
// Type used for the Contract data manipulation within the API
export type IContract = Contract;

// Type for the generated mongoose bilateral contract
export type IBilateralContractDB = BilateralContractDocument;
// Type used for the Bilateral Contract data manipulation within the API
export type IBilateralContract = BilateralContract;
