import { Types } from 'mongoose';

import { IContract, IContractDB } from 'interfaces/contract.interface';
import Contract from 'models/contract.model';
import { logger } from 'utils/logger';
import {
  ContractDataProcessing,
  ContractDocument,
  ContractMember,
  ContractServiceOffering,
  ContractDataProcessingDocument,
} from 'interfaces/schemas.interface';
import { IPolicyInjection } from 'interfaces/policy.interface';
import { genPolicyFromRule } from './policy/utils';
import pdp from 'services/policy/pdp.service';

// Ecosystem Contract Service
export class ContractService {
  private static instance: ContractService;

  private constructor() {}

  public static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService();
    }
    return ContractService.instance;
  }

  // Generate a contract based on the contract data
  public async genContract(
    contractData: IContract,
    role?: string,
  ): Promise<IContract> {
    try {
      const { permission, prohibition, ...rest } = contractData;
      const rolesAndObligations = role
        ? [
            {
              role,
              policies: [
                {
                  permission: permission || [],
                  prohibition: prohibition || [],
                },
              ],
            },
          ]
        : [];
      const newContract = new Contract({
        ...rest,
        rolesAndObligations,
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

  // get policies for a given participant and service offering
  public async getPolicyForServiceOffering(
    contractId: string,
    participantId: string,
    serviceOfferingId: string,
  ): Promise<any | null> {
    try {
      const contract = await Contract.findById(contractId);
      if (!contract) {
        return null;
      }
      const serviceOffering = contract.serviceOfferings.find((offering) => {
        return (
          offering.participant === participantId &&
          offering.serviceOffering === serviceOfferingId
        );
      });
      if (!serviceOffering) {
        return null;
      }
      const policies = serviceOffering.policies;
      return policies;
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
  // Sign contract
  public async signContract(
    contractId: string,
    inputSignature: ContractMember,
  ): Promise<IContract> {
    try {
      // Find the contract by its ID
      const contract = await Contract.findById(contractId, {
        // Exclude unnecessary metadata
        _id: 0,
        __v: 0,
        jsonLD: 0,
      }).lean();
      if (!contract) {
        throw new Error('Contract does not exist.');
      }
      // Check if the current participant exists
      const currentMember = contract.members.find(
        (member) => member.participant === inputSignature.participant,
      );
      if (currentMember) {
        // Update the signature of an existing member
        currentMember.signature = inputSignature.signature;
      } else {
        // Add a new signature if it doesn't exist
        contract.members.push(inputSignature);
      }
      const orchestratorHasSigned = contract.members.find(
        (member) => member.role === 'orchestrator',
      );
      // Check if both parties have signed, including the orchestrator
      const totalMembers = contract.members.length;
      if (totalMembers >= 2 && orchestratorHasSigned) {
        // Set the contract status to 'signed' if there are
        // at least two parties and the orchestrator has signed
        contract.status = 'signed';
      }
      // Update the contract in the database
      const updatedContract = await Contract.findByIdAndUpdate(
        contractId,
        contract,
        { new: true, _id: 0, __v: 0, jsonLD: 0 },
      );
      if (!updatedContract) {
        throw new Error('Error occurred while updating contract signature.');
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

  public async checkExploitationByRole(
    contractId: string,
    data: any,
    sessionId: string,
    role: string,
  ): Promise<boolean> {
    try {
      const contract = await Contract.findById(contractId).lean();
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
      return await pdp.isAuthorised(
        { permission, prohibition },
        sessionId,
        data.policy,
      );
    } catch (error) {
      throw error;
    }
  }

  // Get ecosystem contracts for a specific DID with optional filter
  public async getContractsFor(
    _did: string,
    hasSigned?: boolean,
  ): Promise<IContractDB[]> {
    try {
      let did;
      try {
        const buff = Buffer.from(_did, 'base64');
        did = buff.toString();
      } catch (error: any) {
        throw new Error(error.message);
      }
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
    serviceOffering: string,
    participant: string,
    injections: IPolicyInjection[],
  ): Promise<IContractDB | null> {
    try {
      const contract = await Contract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }
      let offeringIndex = contract.serviceOfferings.findIndex(
        (entry: ContractServiceOffering) =>
          entry.serviceOffering === serviceOffering &&
          entry.participant === participant,
      );
      if (offeringIndex === -1) {
        contract.serviceOfferings.push({
          participant: participant,
          serviceOffering: serviceOffering,
          policies: [],
        });
        offeringIndex = contract.serviceOfferings.length - 1;
      }
      const offering = contract.serviceOfferings[offeringIndex];
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

  public async removeOfferingPolicies(
    contractId: string,
    offeringId: string,
    participantId: string,
  ): Promise<IContractDB | null> {
    try {
      const contract: ContractDocument | null =
        await Contract.findById(contractId);
      if (!contract) {
        throw new Error('Contract not found');
      }
      let offeringIndex = contract.serviceOfferings.findIndex(
        (entry: ContractServiceOffering) =>
          (entry.serviceOffering.includes(offeringId) ||
            entry.serviceOffering === offeringId) &&
          (entry.participant.includes(participantId) ||
            entry.participant === participantId),
      );
      if (offeringIndex !== -1) {
        const offering: ContractServiceOffering =
          contract.serviceOfferings[offeringIndex];
        offering.policies = [];
      } else {
        return contract;
      }
      const updatedContract = await contract.save();
      return updatedContract;
    } catch (error: any) {
      throw error;
    }
  }

  // get data processings
  public async getDataProcessings(
    contractId: string,
  ): Promise<ContractDataProcessing[]> {
    try {
      const contract = await Contract.findById(contractId).lean();
      if (contract) {
        const dataProcessings: ContractDataProcessing[] =
          contract.dataProcessings;
        return dataProcessings;
      } else {
        throw new Error('Contract not found');
      }
    } catch (error) {
      throw error;
    }
  }

  // update data processings
  public async updateDataProcessings(
    contractId: string,
    processings: ContractDataProcessing[],
  ): Promise<ContractDataProcessing[]> {
    try {
      const contract = await Contract.findById(contractId);
      if (contract) {
        contract.dataProcessings =
          processings as Types.DocumentArray<ContractDataProcessingDocument>;
        await contract.save();
        return contract.dataProcessings;
      } else {
        throw new Error('Contract not found');
      }
    } catch (error) {
      throw error;
    }
  }

  public async insertDataProcessing(
    contractId: string,
    processing: ContractDataProcessing,
    index: number,
  ): Promise<ContractDataProcessing> {
    try {
      if (index < 0) {
        throw new Error('Index cannot be negative');
      }
      const contract = await Contract.findById(contractId);
      if (contract) {
        if (index >= contract.dataProcessings.length) {
          contract.dataProcessings.push(processing);
        } else {
          contract.dataProcessings.splice(
            index,
            0,
            processing as ContractDataProcessingDocument,
          );
        }
        await contract.save();
        return processing;
      } else {
        throw new Error('Contract not found');
      }
    } catch (error) {
      throw error;
    }
  }

  public async updateDataProcessing(
    contractId: string,
    processing: ContractDataProcessing,
  ): Promise<ContractDataProcessing> {
    try {
      const contract = await Contract.findById(contractId);
      if (contract) {
        const existingProcessing = contract.dataProcessings.find(
          (item) => item.connectorURI === processing.connectorURI,
        );
        if (existingProcessing) {
          Object.assign(existingProcessing, processing);
          await contract.save();
          return existingProcessing;
        } else {
          throw new Error('Processing not found in the contract');
        }
      } else {
        throw new Error('Contract not found');
      }
    } catch (error) {
      throw error;
    }
  }

  public async deleteDataProcessing(
    contractId: string,
    processing: ContractDataProcessing,
  ): Promise<ContractDataProcessing> {
    try {
      const contract = await Contract.findById(contractId);
      if (contract) {
        const initialLength = contract.dataProcessings.length;
        contract.dataProcessings = contract.dataProcessings.filter(
          (item) => item.connectorURI !== processing.connectorURI,
        ) as Types.DocumentArray<ContractDataProcessingDocument>;
        if (contract.dataProcessings.length !== initialLength) {
          await contract.save();
          return processing;
        } else {
          throw new Error('Processing not found in the contract');
        }
      } else {
        throw new Error('Contract not found');
      }
    } catch (error) {
      throw error;
    }
  }

  private convertContract(contract: IContractDB): any {
    return {};
  }
}

export default ContractService.getInstance();
