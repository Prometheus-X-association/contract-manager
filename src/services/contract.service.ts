import { IContract, IContractDB } from 'interfaces/contract.interface';
import { IAuthorisationPolicy } from 'interfaces/policy.interface';
import { config } from 'config/config';
import Contract from 'models/contract.model';
import { checkFieldsMatching, loadModel } from 'utils/utils';
import pdp from './pdp.service';
import policyProviderService from './policy.provider.service';
import { logger } from 'utils/logger';
import { ContractSignature } from 'interfaces/schemas.interface';

// Ecosystem Contract Service
class ContractService {
  private contractModel: any;
  private static instance: ContractService;

  private constructor() {
    this.initContractModel();
  }

  public static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService();
    }
    return ContractService.instance;
  }

  private initContractModel() {
    console.time('initContractModel');
    this.contractModel = loadModel(config.contract.modelPath);
    console.timeEnd('initContractModel');
  }

  // Validate the contract input data against the contract model
  public isValid(contract: IContract): boolean {
    // Perform validation
    const matching = checkFieldsMatching(contract, this.contractModel);
    if (!matching.success) {
      throw new Error(`${matching.field} is an invalid field.`);
    }
    return matching.success;
  }

  // Generate a contract based on the contract data
  public genContract(contractData: IContract): Promise<IContract> {
    if (!this.contractModel) {
      logger.error('No contract model found.');
      throw new Error('No contract model found.');
    }
    try {
      // Validate the contract input data against the contract model
      this.isValid(contractData);
      // Generate the contrat after validation
      const newContract = new Contract(contractData);
      return newContract.save();
    } catch (error: any) {
      logger.error(error.message);
      throw error;
    }
  }
  // get contract
  public async getContract(contractId: string): Promise<IContractDB | null> {
    try {
      const contract = await Contract.findById(contractId).lean();
      return contract;
    } catch (error) {
      throw error;
    }
  }
  // update contract
  public async updateContract(
    contractId: string,
    updates: Partial<IContractDB>,
  ): Promise<IContractDB | null> {
    try {
      const updatedContract = await Contract.findByIdAndUpdate(
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
      const deletedContract = await Contract.findByIdAndDelete(contractId);
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
    inputSignature: ContractSignature,
  ): Promise<IContract> {
    try {
      // Find the contract by its ID
      const contract = await Contract.findById(contractId, {
        // Exclude useless meta data
        _id: 0,
        __v: 0,
      }).lean();

      if (!contract) {
        throw new Error('The contract does not exist.');
      }
      // Check if the party is the orchestrator
      const isOrchestrator = inputSignature.party === 'orchestrator';
      const currentSignature = contract.signatures.find(
        (signature) => signature.party === signature.party,
      );
      if (currentSignature) {
        // Update the value of an existing signature
        currentSignature.value = inputSignature.value;
      } else {
        // Add a new signature if it doesn't exist
        contract.signatures.push(inputSignature);
      }
      // Check if both parties have signed, including the orchestrator
      const totalSignatures = contract.signatures.length;
      if (totalSignatures >= 2 && isOrchestrator) {
        // Set signed to true if there are at least
        // two parties and the orchestrator who signed
        contract.signed = true;
      }
      // Update the contract in the database
      const updatedContract = await Contract.findByIdAndUpdate(
        contractId,
        contract,
        { new: true, _id: 0, __v: 0 },
      );
      if (!updatedContract) {
        throw new Error('Error occured while updating contract signature.');
      }
      return updatedContract.toObject();
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
      const contract = await Contract.findById(contractId);
      if (!contract) {
        // Contract not found
        return false;
      }
      // Retrieve permissions from the contract
      const permissions = contract.permission;
      // Create an authorization policy based on contract permissions
      const policies: IAuthorisationPolicy[] =
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

export default ContractService.getInstance();
