import {
  IBilateralContract,
  IBilateralContractDB,
} from 'interfaces/contract.interface';
import { BilateralContractSignature } from 'interfaces/schemas.interface';
import BilateralContract from 'models/bilateral.model';
import DataRegistry from 'models/bilateral.model';
import { checkFieldsMatching } from 'utils/utils';
import pdp from './pdp.service';
import policyProviderService from './policy.provider.service';
import { IAuthorisationPolicy } from 'interfaces/policy.interface';
import { logger } from 'utils/logger';
import { IDataRegistry } from 'interfaces/global.interface';

// Bilateral Contract Service
export class BilateralContractService {
  // private contractModel: any;
  private contractModelPromise: Promise<IDataRegistry[]>;
  private static instance: BilateralContractService;

  private constructor() {
    this.contractModelPromise = this.getContractModel();
  }

  public static getInstance(): BilateralContractService {
    if (!BilateralContractService.instance) {
      BilateralContractService.instance = new BilateralContractService();
    }
    return BilateralContractService.instance;
  }

  private async getContractModel(): Promise<IDataRegistry[]> {
    try {
      const dataRegistry = await DataRegistry.findOne();
      if (dataRegistry) {
        // this.contractModel =
        return JSON.parse(dataRegistry.contracts.bilateral);
      } else {
        throw new Error('No contract model found in database');
      }
    } catch (error: any) {
      logger.error(error.message);
      throw error;
    }
  }

  // Validate the contract input data against the contract model
  public async isValid(contract: IBilateralContract): Promise<boolean> {
    const contractModel = await this.contractModelPromise;
    if (!contractModel) {
      throw new Error('No contract model found.');
    }
    // Perform validation
    const matching = checkFieldsMatching(contract, contractModel);
    if (!matching.success) {
      throw new Error(`${matching.success} is an invalid field.`);
    }
    return matching.success;
  }

  // Generate a contract based on the contract data
  public async genContract(
    contractData: IBilateralContract,
  ): Promise<IBilateralContract> {
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
  //
  public async addContractNegociator(
    contractId: string,
    did: string,
  ): Promise<IBilateralContractDB | null> {
    try {
      const updatedContract = await BilateralContract.findByIdAndUpdate(
        contractId,
        { $push: { negotiators: { did: did } } },
        { new: true },
      );
      if (!updatedContract) {
        throw new Error('The contract does not exist.');
      }
      return updatedContract;
    } catch (error: any) {
      throw error;
    }
  }
  // sign contract
  public async signContract(
    contractId: string,
    inputSignature: BilateralContractSignature,
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
        if (!parties.includes(inputSignature.party)) {
          throw new Error('Cannot add a third participant.');
        }
      }
      // Find the party's existing signature
      const existingSignature = existingContract.signatures.find(
        (signature) => signature.party === inputSignature.party,
      );
      if (existingSignature) {
        // Update the value of an existing signature
        existingSignature.value = inputSignature.value;
      } else {
        // Add a new signature if it doesn't exist
        existingContract.signatures.push(inputSignature);
      }
      // Check if both parties have signed
      if (existingContract.signatures.length === 2) {
        // set the contract status to 'revoked' if both parties have signed
        existingContract.status = 'signed';
      }
      // Save the changes to the database
      await existingContract.save();
      return existingContract.toObject();
    } catch (error) {
      throw error;
    }
  }
  // Revoke a signature
  public async revokeSignatureService(
    contractId: string,
    did: string,
  ): Promise<IBilateralContract> {
    try {
      // Find the contract by ID
      const contract = await BilateralContract.findById(contractId);
      // Check if the contract exists
      if (!contract) {
        throw new Error('Contract not found');
      }
      // Find the signature in the signatures array
      const signatureIndex = contract.signatures.findIndex(
        (signature) => signature.did === did,
      );
      // Check if the signature was found
      if (signatureIndex === -1) {
        throw new Error('Signature not found');
      }
      // Retrieve the signature from the signatures array
      const revokedSignature = contract.signatures[signatureIndex];
      // Move the signature from the signatures array to the revokedSignatures array
      contract.signatures.splice(signatureIndex, 1);
      contract.revokedSignatures.push(revokedSignature);
      // Set the contract status to 'revoked'
      contract.status = 'revoked';
      // Save the changes to the database
      await contract.save();
      // Return the updated contract
      return contract;
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
  //
  // Get contracts for a specific DID and an optionnal filter
  public async getContractsFor(
    did: string,
    // An optional parameter that indicates whether a DID is a participant.
    isParticipant?: boolean,
    // Optional parameter indicating whether the contract is signed
    hasSigned?: boolean,
  ): Promise<IBilateralContractDB[]> {
    try {
      let filter: Record<string, any> = {};
      let negotiator = {};
      let signed = {};
      // Include negotiator filter for the specified DID by default
      negotiator = { 'negotiators.did': did };
      if (hasSigned) {
        // Include signed filter for the specified DID if hasSigned is true
        signed = { 'signatures.did': did };
      }
      //
      if (hasSigned === false) {
        // Exclude negotiator filter if hasSigned is false
        negotiator = {};
        // Exclude signed filter for the specified DID
        signed = { 'signatures.did': { $ne: did } };
      }
      //
      if (isParticipant === false) {
        // Exclude negotiator filter if isParticipant is false
        negotiator = { 'negotiators.did': { $ne: did } };
      } else if (isParticipant === true) {
        // Include negotiator filter for the specified DID if isParticipant is true
        negotiator = { 'negotiators.did': did };
      }
      // Combine negotiator and signed filters
      filter = { ...negotiator, ...signed };
      // Retrieve contracts based on the filter
      const contracts = await BilateralContract.find(filter);
      return contracts;
    } catch (error: any) {
      throw new Error(`Error while retrieving contracts: ${error.message}`);
    }
  }
  // Get all contracts
  public async getContracts(status?: string): Promise<IBilateralContractDB[]> {
    try {
      let filter: any = {};
      if (status) {
        if (status.slice(0, 3) !== 'not') {
          filter.status = status;
        } else {
          filter = {
            status: {
              $ne: status.substring(3).toLowerCase(),
            },
          };
        }
      }
      const contracts = await BilateralContract.find(filter).select('-jsonLD');
      return contracts;
    } catch (error: any) {
      throw new Error(`Error while retrieving contracts: ${error.message}`);
    }
  }
  /*
  // Get contracts by status
  public async getContractsByStatus(
    status: string,
  ): Promise<IBilateralContract[]> {
    try {
      const contracts = await BilateralContract.find({ status });
      return contracts;
    } catch (error: any) {
      throw new Error(
        `Error while retrieving contracts by status: ${error.message}`,
      );
    }
  }
  */
  // Get ORDL contract version by id
  public async getODRLContract(
    contractId: string,
    generate: boolean,
  ): Promise<any> {
    try {
      if (!generate) {
        const data = await BilateralContract.findById(contractId)
          .select('jsonLD')
          .lean();
        if (!data?.jsonLD) {
          throw new Error('ODRL contract not found.');
        }
        const contract = JSON.parse(data.jsonLD);
        return contract;
      } else {
        const contract = await BilateralContract.findById(contractId)
          .select('-jsonLD')
          .lean();
        if (contract) {
          this.convertContract(contract);
        }
      }
    } catch (error: any) {
      throw new Error(
        `Error while retrieving the ODRL contract: ${error.message}`,
      );
    }
  }
  private convertContract(contract: IBilateralContractDB): any {
    return {};
  }
}

export default BilateralContractService.getInstance();
