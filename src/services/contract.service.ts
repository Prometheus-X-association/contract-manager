import { IContract, IContractDB } from 'interfaces/contract.interface';
import Contract from 'models/contract.model';
import DataRegistry from 'models/data.registry.model';
import { checkFieldsMatching, replaceValues } from 'utils/utils';
import pdp from './policy/pdp.service';
import { logger } from 'utils/logger';
import { ContractMember } from 'interfaces/schemas.interface';
import { IDataRegistry, IDataRegistryDB } from 'interfaces/global.interface';
import { IContractPolicy, IPolicyInjection } from 'interfaces/policy.interface';
import { genPolicyFromRule } from './policy/utils';

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
      // await this.isValid(contractData);
      const { permission, prohibition, ...rest } = contractData;
      const newContract = new Contract({
        ...rest,
        rolesAndObligations: [
          {
            role: 'ecosystem',
            policies: [
              {
                permission: permission || [],
                prohibition: prohibition || [],
              },
            ],
          },
        ],
      });
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
    inputSignature: ContractMember,
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
      const isOrchestrator = inputSignature.role === 'orchestrator';
      const currentMember = contract.members.find(
        (member) => member.role === inputSignature.role,
      );
      if (currentMember) {
        // Update the value of an existing signature
        currentMember.signature = inputSignature.signature;
      } else {
        // Add a new signature if it doesn't exist
        contract.members.push(inputSignature);
      }
      // Check if both parties have signed, including the orchestrator
      const totalMembers = contract.members.length;
      if (totalMembers >= 2 && isOrchestrator) {
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
      const index = contract.members.findIndex(
        (member) => member.participant === did,
      );
      // Check if the signature was found
      if (index === -1) {
        throw new Error('Member signature not found');
      }
      // Retrieve the signature from the signatures array
      const revoked = contract.members[index];
      // Move the signature from the signatures array to the revokedMembers array
      contract.members.splice(index, 1);
      contract.revokedMembers.push(revoked);
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
  //
  public async checkPermission(
    contractId: string,
    data: any,
    sessionId: string,
  ): Promise<boolean> {
    try {
      const contract = await Contract.findById(contractId);
      if (!contract) {
        return false;
      }
      const rao = contract.rolesAndObligations.find(
        (entry) => entry.role === 'ecosystem',
      );
      if (!rao || !rao.policies) {
        return false;
      }
      const mergedPolicy = rao.policies.reduce(
        (acc, policy) => {
          acc.permission.push(...(policy.permission || []));
          acc.prohibition.push(...(policy.prohibition || []));
          return acc;
        },
        { permission: [], prohibition: [] } as IContractPolicy,
      );
      const { permission, prohibition } = data.policy;
      return pdp.isAuthorised(
        {
          permission: [...mergedPolicy.permission, ...(permission || [])],
          prohibition: [...mergedPolicy.prohibition, ...(prohibition || [])],
        },
        sessionId,
      );
    } catch (error) {
      throw error;
    }
  }

  public async checkExploitationByRole(
    contractId: string,
    data: any,
    sessionId: string,
    role: string,
  ): Promise<boolean> {
    try {
      const contract = await Contract.findById(contractId);
      if (!contract || !contract.rolesAndObligations) {
        return false;
      }
      const rao = contract.rolesAndObligations.find(
        (entry) => entry.role === role,
      );
      if (!rao || !rao.policies) {
        return false;
      }
      const permission = rao.policies
        .flatMap((policy) => policy.permission || [])
        .concat(data.policy?.permission || []);
      const prohibition = rao.policies
        .flatMap((policy) => policy.prohibition || [])
        .concat(data.policy?.prohibition || []);
      return pdp.isAuthorised({ permission, prohibition }, sessionId);
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
        filter.members = { $elemMatch: { participant: did } };
      } else if (hasSigned === false) {
        // Participant must not appear in signatures
        filter.members = { $not: { $elemMatch: { participant: did } } };
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
  public async addPoliciesForRoles(
    contractId: string,
    data: { roles: string[]; policies: IPolicyInjection[] }[],
  ): Promise<IContractDB | null> {
    try {
      const contract = await Contract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }
      for (const entry of data) {
        try {
          const roles = entry.roles;
          const policies = entry.policies;
          if (!roles || !Array.isArray(roles) || roles.length === 0) {
            throw new Error('Roles are not defined or empty');
          }
          for (const role of roles) {
            let roleIndex = contract.rolesAndObligations.findIndex(
              (roleEntry) => roleEntry.role === role,
            );
            if (roleIndex === -1) {
              contract.rolesAndObligations.push({
                role,
                policies: [],
              });
              roleIndex = contract.rolesAndObligations.length - 1;
            }
            const roleEntry = contract.rolesAndObligations[roleIndex];
            for (const injection of policies) {
              try {
                const policy = await genPolicyFromRule(injection);
                roleEntry.policies.push({
                  description: policy.description,
                  permission: policy.permission || [],
                  prohibition: policy.prohibition || [],
                });
              } catch (error) {
                throw error;
              }
            }
          }
        } catch (error) {
          throw error;
        }
      }
      const updatedContract = await contract.save();
      return updatedContract;
    } catch (error: any) {
      throw error;
    }
  }
  //
  public async addPoliciesForRole(
    contractId: string,
    data: { role: string; policies: IPolicyInjection[] },
  ): Promise<IContractDB | null> {
    try {
      const role = data.role;
      if (!role) {
        throw new Error('Role is not defined');
      }
      const contract = await Contract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }
      for (const injection of data.policies) {
        try {
          let roleIndex = contract.rolesAndObligations.findIndex(
            (roleEntry) => roleEntry.role === role,
          );
          if (roleIndex === -1) {
            contract.rolesAndObligations.push({
              role,
              policies: [],
            });
            roleIndex = contract.rolesAndObligations.length - 1;
          }
          const roleEntry = contract.rolesAndObligations[roleIndex];
          const policy = await genPolicyFromRule(injection);
          roleEntry.policies.push({
            description: policy.description,
            permission: policy.permission || [],
            prohibition: policy.prohibition || [],
          });
        } catch (error) {
          throw error;
        }
      }
      const updatedContract = await contract.save();
      return updatedContract;
    } catch (error: any) {
      throw error;
    }
  }
  //
  public async addPolicies(
    contractId: string,
    injections: IPolicyInjection[],
  ): Promise<IContractDB | null> {
    try {
      const contract = await Contract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }
      for (const injection of injections) {
        try {
          const role = injection.role;
          let roleIndex = contract.rolesAndObligations.findIndex(
            (entry) => entry.role === role,
          );
          if (roleIndex === -1) {
            contract.rolesAndObligations.push({
              role,
              policies: [],
            });
            roleIndex = contract.rolesAndObligations.length - 1;
          }
          const roleEntry = contract.rolesAndObligations[roleIndex];
          const policy = await genPolicyFromRule(injection);
          roleEntry.policies.push({
            description: policy.description,
            permission: policy.permission || [],
            prohibition: policy.prohibition || [],
          });
        } catch (error) {
          throw error;
        }
      }
      const updatedContract = await contract.save();
      return updatedContract;
    } catch (error: any) {
      throw error;
    }
  }
  //
  public async addPolicy(
    contractId: string,
    injection: IPolicyInjection,
  ): Promise<IContractDB | null> {
    try {
      const contract = await Contract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }
      const role = injection.role;
      let roleIndex = contract.rolesAndObligations.findIndex(
        (entry) => entry.role === role,
      );
      if (roleIndex === -1) {
        contract.rolesAndObligations.push({
          role,
          policies: [],
        });
        roleIndex = contract.rolesAndObligations.length - 1;
      }
      const roleEntry = contract.rolesAndObligations[roleIndex];
      const policy = await genPolicyFromRule(injection);
      roleEntry.policies.push({
        description: policy.description,
        permission: policy.permission || [],
        prohibition: policy.prohibition || [],
      });
      const updatedContract = await contract.save();
      return updatedContract;
    } catch (error) {
      throw error;
    }
  }

  public async addOfferingPolicies(
    contractId: string,
    offeringId: string,
    injections: IPolicyInjection[],
  ): Promise<IContractDB | null> {
    try {
      const contract = await Contract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }
      const offeringIndex = contract.serviceOfferings.findIndex(
        (entry) => entry.serviceOffering === offeringId,
      );
      if (offeringIndex === -1) {
        contract.serviceOfferings.push({
          offering: offeringId,
          policies: [],
        });
      }
      const offering = contract.rolesAndObligations[offeringIndex];
      for (const injection of injections) {
        try {
          const policy = await genPolicyFromRule(injection);
          offering.policies.push({
            description: policy.description,
            permission: policy.permission || [],
            prohibition: policy.prohibition || [],
          });
        } catch (error) {
          throw error;
        }
      }
      const updatedContract = await contract.save();
      return updatedContract;
    } catch (error: any) {
      throw error;
    }
  }

  private convertContract(contract: IContractDB): any {
    return {};
  }
}

export default ContractService.getInstance();
