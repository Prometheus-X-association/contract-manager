import {
  IBilateralContract,
  IBilateralContractDB,
} from 'interfaces/contract.interface';
import { BilateralContractSignature } from 'interfaces/schemas.interface';
import BilateralContract from 'models/bilateral.model';
import pdp from './policy/pdp.service';
import { logger } from 'utils/logger';
import { genPolicyFromRule } from './policy/utils';
import { IPolicyInjection } from 'interfaces/policy.interface';

// Bilateral Contract Service
export class BilateralContractService {
  private static instance: BilateralContractService;

  private constructor() {}

  public static getInstance(): BilateralContractService {
    if (!BilateralContractService.instance) {
      BilateralContractService.instance = new BilateralContractService();
    }
    return BilateralContractService.instance;
  }

  // Generate a contract based on the contract data
  public async genContract(
    contractData: IBilateralContract,
  ): Promise<IBilateralContract> {
    try {
      if (
        !contractData.dataProvider ||
        !contractData.dataConsumer ||
        !contractData.serviceOffering
      ) {
        throw new Error(
          `Missing required fields: ${
            !contractData.dataProvider ? 'dataProvider ' : ''
          }${!contractData.dataConsumer ? 'dataConsumer ' : ''}${
            !contractData.serviceOffering ? 'serviceOffering' : ''
          }`,
        );
      }
      // Validate the contract input data against the contract model
      // await this.isValid(contractData);
      // Generate the contrat after validation
      const newContract = new BilateralContract(contractData);
      return newContract.save();
    } catch (error: any) {
      logger.error('[bilateral/Service, genContract]:', error);
      throw error;
    }
  }

  // get contract
  public async getContract(
    contractId: string,
  ): Promise<IBilateralContractDB | null> {
    try {
      const contract = await BilateralContract.findById(contractId).lean();
      return contract;
    } catch (error) {
      logger.error('[bilateral/Service, getContract]:', error);
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
      logger.error('[bilateral/Service, updateContract]:', error);
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
      logger.error('[bilateral/Service, deleteContract]:', error);
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
      logger.error('[bilateral/Service, addContractNegociator]:', error);
      throw error;
    }
  }
  // sign contract
  public async signContract(
    contractId: string,
    inputSignature: BilateralContractSignature,
  ): Promise<IBilateralContract> {
    try {
      const existingContract = await BilateralContract.findById(contractId);

      if (!existingContract) {
        throw new Error('The contract does not exist.');
      }
      // Check if the contract already has two participants
      if (existingContract.signatures.length >= 2) {
        // Check if the new participant is different from the existing ones
        const dids = existingContract.signatures.map(
          (signature) => signature.did,
        );
        if (!dids.includes(inputSignature.did)) {
          throw new Error('Cannot add a third participant.');
        }
      }
      // Add or Update the signature
      const existingSignature = existingContract.signatures.find(
        (signature) => signature.did === inputSignature.did,
      );
      if (existingSignature) {
        existingSignature.value = inputSignature.value;
      } else {
        existingContract.signatures.push(inputSignature);
      }
      // If both parties have signed set the contract status to 'revoked'
      if (existingContract.signatures.length === 2) {
        existingContract.status = 'signed';
      }
      // Save the changes to the database
      await existingContract.save();
      return existingContract.toObject();
    } catch (error) {
      logger.error('[bilateral/Service, signContract]:', error);
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
      logger.error('[bilateral/Service, revokeSignatureService]:', error);
      throw error;
    }
  }

  // Check if data is authorized for exploitation
  public async checkPermission(
    contractId: string,
    data: any,
    sessionId: string,
  ): Promise<boolean> {
    try {
      const contract = await BilateralContract.findById(contractId);
      if (!contract || !contract.policy) {
        return false;
      }
      const { permission, prohibition } = data.policy;
      return await pdp.isAuthorised(
        {
          permission: [
            ...contract.policy.map((p) => p.permission),
            ...(permission || []),
          ],
          prohibition: [
            ...contract.policy.map((p) => p.prohibition),
            ...(prohibition || []),
          ],
        },
        sessionId,
        data.policy,
      );
    } catch (error) {
      logger.error('[bilateral/Service, checkPermission]:', error);
      throw error;
    }
  }

  // Get contracts for a specific DID and an optionnal filter
  public async getContractsFor(
    _did: string,
    // An optional parameter that indicates whether a DID is a participant.
    isParticipant?: boolean,
    // Optional parameter indicating whether the contract is signed
    hasSigned?: boolean,
  ): Promise<IBilateralContractDB[]> {
    try {
      let did;
      try {
        const buff = Buffer.from(_did, 'base64');
        did = buff.toString();
      } catch (error: any) {
        throw new Error(error.message);
      }
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
      logger.error('[bilateral/Service, getContractsFor]:', error);
      throw new Error(`Error while retrieving contracts: ${error.message}`);
    }
  }
  // Get all contracts
  public async getContracts(status?: string): Promise<IBilateralContractDB[]> {
    try {
      let filter: any = {};
      if (status) {
        if (!status.startsWith('not')) {
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
      logger.error('[bilateral/Service, getContracts]:', error);
      throw new Error(`Error while retrieving contracts: ${error.message}`);
    }
  }

  public async addPolicies(
    contractId: string,
    injections: IPolicyInjection[],
  ): Promise<IBilateralContractDB | null> {
    try {
      const contract = await BilateralContract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }
      for (const injection of injections) {
        try {
          const { ruleId } = injection;
          const policy = await genPolicyFromRule(injection);
          const index = contract.policy.findIndex(
            (entry) => entry.uid === ruleId,
          );
          if (index !== -1) {
            const contractPolicy = contract.policy[index];
            contractPolicy.description = policy.description;
            contractPolicy.permission = policy.permission || [];
            contractPolicy.prohibition = policy.prohibition || [];
          } else {
            contract.policy.push({
              ruleId,
              description: policy.description,
              permission: policy.permission || [],
              prohibition: policy.prohibition || [],
            });
          }
        } catch (error: any) {
          logger.error(`Error injecting policy: ${error.message}`);
        }
      }
      const updatedContract = await contract.save();
      return updatedContract;
    } catch (error: any) {
      logger.error('[bilateral/Service, addPolicies]:', error);
      throw error;
    }
  }
  //
  public async addPolicyFromId(
    contractId: string,
    ruleId: string,
    values?: any,
  ): Promise<IBilateralContractDB | null> {
    try {
      const contract = await BilateralContract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }
      const policy = await genPolicyFromRule({ ruleId, values });
      const index = contract.policy.findIndex((entry) => entry.uid === ruleId);
      if (index !== -1) {
        const contractPolicy = contract.policy[index];
        contractPolicy.description = policy.description;
        contractPolicy.permission = policy.permission || [];
        contractPolicy.prohibition = policy.prohibition || [];
      } else {
        contract.policy.push({
          ruleId,
          description: policy.description,
          permission: policy.permission || [],
          prohibition: policy.prohibition || [],
        });
      }
      const updatedContract = await contract.save();
      return updatedContract;
    } catch (error) {
      logger.error('[bilateral/Service, addPolicyFromId]:', error);
      throw error;
    }
  }

  /**
   * Removes all bilateral contracts associated with a service offering.
   * This comes in handy when a service offering is deleted on a catalog and
   * we want existing contracts to be deleted as well.
   */
  public async deleteManyFromOffering(serviceOfferingId: string) {
    try {
      const deleted = await BilateralContract.deleteMany({
        $or: [
          { serviceOffering: serviceOfferingId },
          { 'purpose.purpose': { $in: [serviceOfferingId] } },
        ],
      });

      return deleted.deletedCount;
    } catch (error) {
      logger.error('[bilateral/Service, deleteFromOffering]:', error);
      throw error;
    }
  }

  private convertContract(contract: IBilateralContractDB): any {
    return {};
  }
}

export default BilateralContractService.getInstance();
