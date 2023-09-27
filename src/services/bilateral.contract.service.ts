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
    party: string | undefined,
    value: string | undefined,
  ): Promise<IBilateralContract> {
    try {
      // Find the contract by its ID and according to the party
      const updatedContract = await BilateralContract.findOneAndUpdate(
        // Condition to find the existing element
        { _id: contractId, 'signatures.party': party },
        // Replace the signature value
        { $set: { 'signatures.$.value': value } },
        { new: true },
      ).lean();
      if (!updatedContract) {
        // If the party doesn't exist, push it
        const updatedContractWithPush =
          await BilateralContract.findByIdAndUpdate(
            contractId,
            { $push: { signatures: { party, value } } },
            { new: true },
          );
        if (!updatedContractWithPush) {
          throw new Error('The contract does not exist.');
        }
        // Check if both parties have signed
        if (updatedContractWithPush.signatures.length === 2) {
          // Set signed to true if both parties have signed
          updatedContractWithPush.signed = true;
          // Save the changes to the database
          await updatedContractWithPush.save();
        }
        return updatedContractWithPush.toObject();
      }
      return updatedContract;
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
