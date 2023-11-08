import { IContract, IContractDB } from 'interfaces/contract.interface';
import Contract from 'models/contract.model';
import Policy from 'models/policy.model';
import DataRegistry from 'models/data.registry.model';
import { checkFieldsMatching } from 'utils/utils';
import pdp from './policy/pdp.service';
import { logger } from 'utils/logger';
import { ContractSignature } from 'interfaces/schemas.interface';
import { IDataRegistry, IDataRegistryDB } from 'interfaces/global.interface';
import { buildConstraints } from 'services/policy/utils';

// Ecosystem Contract Service
export class ContractService {
  private static instance: ContractService;
  private contractModelPromise: Promise<IDataRegistry[]>;

  private constructor() {
    this.contractModelPromise = this.getContractModel();
  }

  public static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService();
    }
    return ContractService.instance;
  }

  private async getContractModel(): Promise<IDataRegistry[]> {
    try {
      const dataRegistry: IDataRegistryDB | null =
        await DataRegistry.findOne().select('contracts.ecosystem');
      if (dataRegistry) {
        const contractModel = dataRegistry.contracts?.ecosystem;
        if (contractModel) {
          return JSON.parse(contractModel);
        } else {
          throw new Error('No contract model found in database');
        }
      } else {
        throw new Error(
          '[Contract/Service, getContractModel]: Something went wrong while fetching data from registry',
        );
      }
    } catch (error: any) {
      logger.error(error.message);
      throw error;
    }
  }

  // Validate the contract input data against the contract model
  public async isValid(contract: IContract): Promise<boolean> {
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
  public async genContract(contractData: IContract): Promise<IContract> {
    try {
      // Validate the contract input data against the contract model
      await this.isValid(contractData);
      // Generate the contrat after validation
      const newContract = new Contract(contractData);
      return newContract.save();
    } catch (error: any) {
      logger.error('[Contract/Service, genContract]:', error);
      throw error;
    }
  }

  // get contract
  public async getContract(contractId: string): Promise<IContractDB | null> {
    try {
      const contract = await Contract.findById(contractId)
        .select('-jsonLD')
        .lean();
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
          select: '-jsonLD',
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
        await Contract.findByIdAndDelete(contractId).select('-jsonLD');
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
        jsonLD: 0,
      }).lean();

      if (!contract) {
        throw new Error('The contract does not exist.');
      }
      // Check if the party is the orchestrator
      const isOrchestrator = inputSignature.party === 'orchestrator';
      const currentSignature = contract.signatures.find(
        (signature) => signature.party === inputSignature.party,
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
        // Set the contract status to 'revoked' if there are
        // at least two parties and the orchestrator who signed
        contract.status = 'signed';
      }
      // Update the contract in the database
      const updatedContract = await Contract.findByIdAndUpdate(
        contractId,
        contract,
        { new: true, _id: 0, __v: 0, jsonLD: 0 },
      );
      if (!updatedContract) {
        throw new Error('Error occured while updating contract signature.');
      }
      return updatedContract.toObject();
    } catch (error) {
      throw error;
    }
  }
  // Revoke a signature
  public async revokeSignatureService(
    contractId: string,
    did: string,
  ): Promise<IContract> {
    try {
      // Find the contract by ID
      const contract = await Contract.findById(contractId).select('-jsonLD');
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
    sessionId: string,
  ): Promise<boolean> {
    try {
      // Retrieve contract data by ID
      const contract = await Contract.findById(contractId);
      if (!contract) {
        // Contract not found
        return false;
      }
      const { permission, prohibition } = data.policy;
      return pdp.isAuthorised(
        {
          permission: [...(contract.permission || []), ...(permission || [])],
          prohibition: [
            ...(contract.prohibition || []),
            ...(prohibition || []),
          ],
        },
        sessionId,
      );
    } catch (error) {
      throw error;
    }
  }

  // Get ecosystem contracts for a specific DID with optional filter
  public async getContractsFor(
    did: string,
    hasSigned?: boolean,
  ): Promise<IContractDB[]> {
    try {
      const filter: Record<string, any> = {};
      if (hasSigned) {
        // Participant must appear in signatures
        filter.signatures = { $elemMatch: { did: did } };
      } else if (hasSigned === false) {
        // Participant must not appear in signatures
        filter.signatures = { $not: { $elemMatch: { did: did } } };
      }
      const contracts = await Contract.find(filter).select('-jsonLD');
      return contracts;
    } catch (error: any) {
      throw new Error(
        `Error while retrieving ecosystem contracts: ${error.message}`,
      );
    }
  }
  // Get all contracts
  public async getContracts(status?: string): Promise<IContractDB[]> {
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
      const contracts = await Contract.find(filter).select('-jsonLD');
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
        const data = await Contract.findById(contractId)
          .select('jsonLD')
          .lean();
        if (!data?.jsonLD) {
          throw new Error('ODRL contract not found.');
        }
        const contract = JSON.parse(data.jsonLD);
        return contract;
      } else {
        const contract = await Contract.findById(contractId)
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
  public async addPolicyFromId(
    contractId: string,
    policyId: string,
    replacement?: any,
  ): Promise<IContractDB | null> {
    try {
      const contract = await Contract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }
      const policy = await Policy.findById(policyId);
      if (!policy) {
        throw new Error(`Policy with id ${policyId} not found`);
      }

      let jsonLD = policy.jsonLD;
      Object.keys(replacement || {}).forEach((key) => {
        let value = replacement[key];
        value =
          typeof value === 'string' ? `"${value}"` : JSON.stringify(value);
        jsonLD = jsonLD.replace(new RegExp(`"@{${key}}"`, 'g'), value);
      });
      const policyData = JSON.parse(jsonLD);

      const missingReplacements = jsonLD.match(/"@{.+?}"/g);
      if (missingReplacements) {
        throw new Error(
          `Missing replacements for: ${missingReplacements.join(', ')}`,
        );
      }

      if (policyData.permission) {
        for (const permission of policyData.permission) {
          contract.permission.push(permission);
        }
      }
      if (policyData.prohibition) {
        for (const prohibition of policyData.prohibition) {
          contract.prohibition.push(prohibition);
        }
      }
      const updatedContract = await contract.save();
      return updatedContract;
    } catch (error) {
      throw error;
    }
  }

  private convertContract(contract: IContractDB): any {
    return {};
  }
}

export default ContractService.getInstance();
