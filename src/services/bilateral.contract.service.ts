import {
  IBilateralContract,
  IBilateralContractDB,
} from 'interfaces/contract.interface';
import { config } from 'config/config';
import BilateralContract from 'models/bilateral.contract.model';
import { checkFieldsMatching, loadModel } from 'utils/utils';
import pdp, { AuthorizationPolicy } from './pdp.service';
import policyProviderService from './policy.provider.service';

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
    this.contractModel = loadModel(config.contract.modelPath);
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
  // get contract
  public async getContract(
    contractId: string,
  ): Promise<IBilateralContractDB | null> {
    try {
      const contract = await BilateralContract.findById(contractId).lean();
      return contract;
    } catch (error) {
      throw error;
    }
  }
  // update contract
  public async updateContract(
    contractId: string,
    updates: Partial<IBilateralContractDB>,
  ): Promise<IBilateralContractDB | null> {
    try {
      const updatedContract = await BilateralContract.findByIdAndUpdate(
        contractId,
        updates,
        {
          new: true,
        },
      ).lean();
      return updatedContract;
    } catch (error) {
      throw error;
    }
  }
  // delete contract
  public async deleteContract(contractId: string): Promise<void> {
    try {
      const deletedContract =
        await BilateralContract.findByIdAndDelete(contractId);
      if (!deletedContract) {
        throw new Error('Contract not found.');
      }
    } catch (error) {
      throw error;
    }
  }
  // sign contract
  public async signContract(
    contractId: string,
    party: string,
    value: string,
  ): Promise<IBilateralContract> {
    try {
      // Find the contract by its ID
      const existingContract = await BilateralContract.findById(contractId);

      if (!existingContract) {
        throw new Error('The contract does not exist.');
      }
      // Check if the contract already has two participants
      if (existingContract.signatures.length >= 2) {
        // Check if the new party is different from the existing ones
        const parties = existingContract.signatures.map(
          (signature) => signature.party,
        );
        if (!parties.includes(party)) {
          throw new Error('Cannot add a third participant.');
        }
      }
      // Find the party's existing signature
      const existingSignature = existingContract.signatures.find(
        (signature) => signature.party === party,
      );
      if (existingSignature) {
        // Update the value of an existing signature
        existingSignature.value = value;
      } else {
        // Add a new signature if it doesn't exist
        existingContract.signatures.push({ party, value });
      }
      // Check if both parties have signed
      if (existingContract.signatures.length === 2) {
        // Set signed to true if both parties have signed
        existingContract.signed = true;
      }
      // Save the changes to the database
      await existingContract.save();
      return existingContract.toObject();
    } catch (error) {
      throw error;
    }
  }

  // Check if data is authorized for exploitation
  // according to the contract permission
  public async checkPermission(
    contractId: string,
    data: any,
  ): Promise<boolean> {
    try {
      // Retrieve contract data by ID
      const contract = await BilateralContract.findById(contractId);
      if (!contract) {
        // Contract not found
        return false;
      }
      // Retrieve permissions from the contract
      const permissions = contract.permission;
      // Create an authorization policy based on contract permissions
      const policies: AuthorizationPolicy[] =
        policyProviderService.genPolicies(permissions);
      // Use the PDP to evaluate the authorization policy
      pdp.defineReferencePolicies(policies);
      const isAuthorized = pdp.evalPolicy(data.policies);
      return isAuthorized;
    } catch (error) {
      throw error;
    }
  }
}

export default BilateralContractService.getInstance();
