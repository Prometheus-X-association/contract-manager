import { IBilateralContract } from 'interfaces/contract.interface';
import { config } from 'config/config';
import BilateralContract from 'models/bilateral.contract.model';
import { checkFieldsMatching, loadModel } from 'utils/utils';

// Bilateral Contract Service
class BilateralContractService {
  private contractModel: any;
  private static instance: BilateralContractService;

  private constructor() {
    this.initContractModel();
  }

  public static getInstance(): BilateralContractService {
    if (!BilateralContractService.instance) {
      BilateralContractService.instance = new BilateralContractService();
    }
    return BilateralContractService.instance;
  }

  private initContractModel() {
    console.time('initContractModel');
    this.contractModel = loadModel(config.bilateralContract.modelPath);
    console.timeEnd('initContractModel');
  }

  // Validate the contract input data against the contract model
  public isValid(contract: IBilateralContract): boolean {
    if (!this.contractModel) {
      throw new Error('No contract model found.');
    }
    // Perform validation
    const matching = checkFieldsMatching(contract, this.contractModel);
    if (!matching.success) {
      throw new Error(`${matching.success} is an invalid field.`);
    }
    return matching.success;
  }

  // Generate a contract based on the contract data
  public genContract(
    contractData: IBilateralContract,
  ): Promise<IBilateralContract> {
    if (!this.contractModel) {
      throw new Error('No contract model found.');
    }
    // Validate the contract input data against the contract model
    this.isValid(contractData);
    // Generate the contrat after validation
    const newContract = new BilateralContract(contractData);
    return newContract.save();
  }
}

export default BilateralContractService.getInstance();
