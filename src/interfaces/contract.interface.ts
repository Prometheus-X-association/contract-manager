import {
  ContractDocument,
  Contract,
  BilateralContractDocument,
  BilateralContract,
} from './schemas.interface';

// Interface for the generated ODRL contract
export type IContractDB = ContractDocument;
// Type used for the Contract data manipulation within the API
export type IContract = Contract;

// Interface for the generated ODRL bilateral contract
export type IBilateralContractDB = BilateralContractDocument;
// Type used for the Bilateral Contract data manipulation within the API
export type IBilateralContract = BilateralContract;
