import {
  IBilateralContract,
  IBilateralContractDB,
} from 'interfaces/contract.interface';
import { BilateralContractSignature } from 'interfaces/schemas.interface';
import BilateralContract from 'models/bilateral.model';
import DataRegistry from 'models/data.registry.model';
import Rule from 'models/rule.model';
import { checkFieldsMatching, replaceValues } from 'utils/utils';
import pdp from './policy/pdp.service';
import { logger } from 'utils/logger';
import { IDataRegistry, IDataRegistryDB } from 'interfaces/global.interface';
import { genPolicyFromRule } from './policy/utils';
import { IPolicyInjection } from 'interfaces/policy.interface';

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
      const dataRegistry: IDataRegistryDB | null =
        await DataRegistry.findOne().select('contracts.bilateral');
      if (dataRegistry) {
        const contractModel = dataRegistry.contracts?.bilateral;
        if (contractModel) {
          return JSON.parse(contractModel);
        } else {
          throw new Error('No contract model found in database');
        }
      } else {
        throw new Error(
          '[Bilateral/Service, getContractModel]: Something went wrong while fetching data from registry',
        );
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
      throw new Error(`${matching.field} is an invalid field.`);
    }
    return matching.success;
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
      throw error;
    }
  }

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
  //
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
          console.error(`Error injecting policy: ${error.message}`);
        }
      }
      const updatedContract = await contract.save();
      return updatedContract;
    } catch (error: any) {
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
      const policy = await genPolicyFromRule(values);
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
      throw error;
    }
  }

  private convertContract(contract: IBilateralContractDB): any {
    return {};
  }
}

export default BilateralContractService.getInstance();
