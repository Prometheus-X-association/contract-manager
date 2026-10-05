// Ecosystem Contract Controller
import { Request, Response } from 'express';
import {
  CONTRACT_OFFERING_FLATTENED_KEYS,
  IContract,
  IContractDB,
  IContractMember,
  IContractOfferingFlattenedFields,
} from 'interfaces/contract.interface';
import { ContractService } from 'services/contract.service';
import { logger } from 'utils/logger';
import { validationResult } from 'express-validator';
import { ContractMember } from '../interfaces/schemas.interface';

export const createContract = async (req: Request, res: Response) => {
  const contractService = await ContractService.getInstance();
  try {
    const { contract, role } = req.body;
    if (contract) {
      const generated: IContract = await contractService.genContract(
        contract,
        role,
      );
      logger.info('[Contract/Controller: createContract] Successfully called.');
      return res.status(201).json(generated);
    } else {
      throw new Error('Input contract undefined');
    }
  } catch (error: any) {
    res.status(500).json({
      message: `An error occurred while creating the contract.`,
      error: error.message,
    });
  }
};

/**
 * Get contract by id
 * @description this route stays unconditional on purpose. Deployed connectors (>= 1.11.0) fetch the contract here with a plain GET and must be able to read `pending` and `revoked` contracts. Status-based access control lives  in `getValidatedContract` (POST /contracts/:id/validate), which is opt-in.
 * @param req
 * @param res
 */
export const getContract = async (req: Request, res: Response) => {
  const contractService = await ContractService.getInstance();
  try {
    const contractId: string = req.params.id;
    const contract = await contractService.getContract(contractId);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }
    logger.info('[Contract/Controller: getContract] Successfully called.');
    return res.json(contract);
  } catch (error) {
    logger.error('Error retrieving the contract:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while retrieving the contract.' });
  }
};

export const getPolicyForServiceOffering = async (
  req: Request,
  res: Response,
) => {
  const contractService = await ContractService.getInstance();
  try {
    const contractId: string = req.params.id;
    const participantId: string = req.query.participant as string;
    const serviceOfferingId: string = req.query.serviceOffering as string;

    const policy = await contractService.getPolicyForServiceOffering(
      contractId,
      participantId,
      serviceOfferingId,
    );

    if (!policy) {
      return res.status(404).json({
        error: 'Policy not found for the specified service offering.',
      });
    }

    logger.info(
      '[Contract/Controller: getPolicyForServiceOffering] Successfully called.',
    );
    return res.json(policy);
  } catch (error) {
    logger.error(
      'Error retrieving the policy for the service offering:',
      error,
    );
    res
      .status(500)
      .json({ error: 'An error occurred while retrieving the policy.' });
  }
};

export const updateContract = async (req: Request, res: Response) => {
  const contractService = await ContractService.getInstance();
  try {
    const contractId: string = req.params.id;
    const updates: Partial<IContractDB> = req.body;
    const updatedContract = await contractService.updateContract(
      contractId,
      updates,
    );
    if (!updatedContract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }
    logger.info('[Contract/Controller: updateContract] Successfully called.');
    return res.json(updatedContract);
  } catch (error) {
    logger.error('Error updating the contract:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while updating the contract.' });
  }
};

export const deleteContract = async (req: Request, res: Response) => {
  const contractService = await ContractService.getInstance();
  try {
    const contractId: string = req.params.id;
    await contractService.deleteContract(contractId);
    logger.info('[Contract/Controller: deleteContract] Successfully called.');
    return res.json({ message: 'Contract deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting the contract:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while deleting the contract.' });
  }
};

export const signContract = async (req: Request, res: Response) => {
  const contractService = await ContractService.getInstance();
  try {
    const contractId: string = req.params.id;
    const member: ContractMember = req.body;
    const updatedContract = await contractService.signContract(
      contractId,
      member,
    );
    logger.info('[Contract/Controller: signContract] Successfully called.');
    return res.json(updatedContract);
  } catch (error) {
    logger.error('Error signing the contract:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while signing the contract.' });
  }
};

export const revokeContractSignature = async (req: Request, res: Response) => {
  const contractService = await ContractService.getInstance();
  const { id, did } = req.params;
  try {
    const revokedSignature = await contractService.revokeSignatureService(
      id,
      did,
    );
    logger.info(
      '[Contract/Controller: revokeContractSignature] Successfully called.',
    );
    return res.status(200).json(revokedSignature);
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const checkExploitationByRole = async (req: Request, res: Response) => {
  const contractService = await ContractService.getInstance();
  const contractId = req.params.id;
  const role = req.params.role;
  const data = { policy: req.body };
  const sessionId = req.session.id;
  try {
    const isAuthorised = await contractService.checkExploitationByRole(
      contractId,
      data,
      sessionId,
      role,
    );
    if (isAuthorised) {
      return res.status(200).json({ authorised: true });
    } else {
      return res.status(403).json({ authorised: false });
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getContractsFor = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const contractService = await ContractService.getInstance();
  try {
    const did: string | undefined = req.params.did;
    const hasSigned: boolean = req.query.hasSigned !== 'false';
    const participantRole = (
      ['all', 'orchestrator', 'member'].includes(req.query.role as string)
        ? req.query.role
        : 'all'
    ) as 'all' | 'orchestrator' | 'member';
    const contracts: IContractDB[] = await contractService.getContractsFor(
      did,
      participantRole,
      hasSigned,
    );
    logger.info('[Contract/Controller: getContractsFor] Successfully called.');
    res.status(200).json({ contracts: contracts });
  } catch (error: any) {
    logger.error('Error while fetching contracts for the given DID:', {
      error,
    });
    res.status(500).json({ error: error.message });
  }
};

export const getContracts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const contractService = await ContractService.getInstance();
  try {
    const status = req.query.status ? String(req.query.status) : undefined;
    const contracts: IContractDB[] = await contractService.getContracts(status);
    logger.info('[Contract/Controller: getAllContracts] Successfully called.');
    res.status(200).json({ contracts: contracts });
  } catch (error: any) {
    logger.error('Error while fetching all contract:', { error });
    res.status(500).json({ error: error.message });
  }
};

export const injectPoliciesForRoles = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const contractService = await ContractService.getInstance();
  try {
    const contractId: string = req.params.id;
    const updatedContract = await contractService.addPoliciesForRoles(
      contractId,
      req.body,
    );
    res.status(200).json({ contract: updatedContract });
  } catch (error) {
    logger.error('Error while injecting policies:', error);
    const message = (error as Error).message;
    res.status(500).json({ error: message });
  }
};

export const injectPoliciesForRole = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const contractService = await ContractService.getInstance();
  try {
    const contractId: string = req.params.id;
    const updatedContract = await contractService.addPoliciesForRole(
      contractId,
      req.body,
    );
    res.status(200).json({ contract: updatedContract });
  } catch (error) {
    logger.error('Error while injecting policies:', error);
    const message = (error as Error).message;
    res.status(500).json({ error: message });
  }
};

export const injectPolicies = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const contractService = await ContractService.getInstance();
  try {
    const contractId: string = req.params.id;
    const updatedContract = await contractService.addPolicies(
      contractId,
      req.body,
    );
    res.status(200).json({ contract: updatedContract });
  } catch (error) {
    logger.error('Error while injecting policies:', error);
    const message = (error as Error).message;
    res.status(500).json({ error: message });
  }
};

export const injectPolicy = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const contractService = await ContractService.getInstance();
  try {
    const role: string = req.body.role;
    const contractId: string = req.params.id;
    if (role) {
      const updatedContract = await contractService.addPolicy(
        contractId,
        req.body,
      );
      res.status(200).json({ contract: updatedContract });
    } else {
      throw new Error(
        '[Contract/Controller: injectRolePolicy] Role is not defined.',
      );
    }
  } catch (error) {
    logger.error('Error while injecting policy:', error);
    const message = (error as Error).message;
    res.status(500).json({ error: message });
  }
};

export const injectOfferingPolicies = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const contractService = await ContractService.getInstance();
  try {
    const contractId: string = req.params.id;
    const { serviceOffering, policies, participant } = req.body;
    if (contractId && serviceOffering && participant && policies) {
      // Whitelist the flattened catalog fields out of the body, so an unexpected
      // key can never reach the offering subdocument.
      const flattened: IContractOfferingFlattenedFields = {};
      for (const key of CONTRACT_OFFERING_FLATTENED_KEYS) {
        if (req.body[key] !== undefined) {
          flattened[key] = req.body[key];
        }
      }

      const updatedContract = await contractService.addOfferingPolicies(
        contractId,
        serviceOffering,
        participant,
        policies,
        flattened,
      );
      res.status(200).json({ contract: updatedContract });
    } else {
      throw new Error('Invalid paylaod.');
    }
  } catch (error) {
    logger.error(
      '[Contract/Controller/injectOfferingPolicies] Error while injecting offering policies:',
      error,
    );
    const message = (error as Error).message;
    res.status(500).json({ error: message });
  }
};

export const removeOfferingPolicies = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const contractService = await ContractService.getInstance();
  try {
    validationResult(req).throw();
    const { contractId, offeringId, participantId } = req.params;
    if (contractId && offeringId) {
      const contract = await contractService.removeOfferingPolicies(
        contractId,
        offeringId,
        participantId,
      );
      res.status(200).json({ contract });
    } else {
      throw new Error('Invalid paylaod.');
    }
  } catch (error) {
    logger.error(
      '[Contract/Controller/removeOfferingPolicies] Error while removing offering policies:',
      error,
    );
    const message = (error as Error).message;
    res.status(500).json({ error: message });
  }
};

export const getServiceChains = async (req: Request, res: Response) => {
  const contractService = await ContractService.getInstance();
  try {
    const contractId: string = req.params.id;
    const serviceChains = await contractService.getServiceChains(contractId);
    if (!serviceChains) {
      return res.json([]);
    }
    return res.json(serviceChains);
  } catch (error) {
    logger.error('Error retrieving the service chains:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while retrieving service chains.' });
  }
};

export const writeServiceChains = async (req: Request, res: Response) => {
  const contractService = await ContractService.getInstance();
  try {
    const contractId: string = req.params.id;
    const processings = req.body;
    processings.forEach((processing: any) => {
      if (processing.services) {
        processing.services.forEach((service: any) => {
          if (
            service.incentivePoints === null ||
            service.incentivePoints === undefined
          ) {
            service.incentivePoints = 0;
          }
        });
      }
    });

    const serviceChains = await contractService.writeServiceChains(
      contractId,
      processings,
    );
    if (!serviceChains) {
      throw new Error('something went wrong while writing service chains');
    }
    return res.json(serviceChains);
  } catch (error) {
    logger.error('Error while writing service chains:', error);
    res.status(500).json({
      error: 'An error occurred while while writing service chains.',
    });
  }
};

export const insertServiceChain = async (req: Request, res: Response) => {
  const contractService = await ContractService.getInstance();
  try {
    const { id: contractId } = req.params;
    const processing = req.body;
    const serviceChains = await contractService.insertServiceChain(
      contractId,
      processing,
    );
    if (!serviceChains) {
      throw new Error('something went wrong while inserting service chain.');
    }
    return res.json(serviceChains);
  } catch (error) {
    logger.error('Error while inserting service chain:', error);
    res.status(500).json({
      error: 'An error occurred while inserting service chain.',
    });
  }
};

export const updateServiceChain = async (req: Request, res: Response) => {
  const contractService = await ContractService.getInstance();
  try {
    const { id: contractId, chainId } = req.params;
    const processing = req.body;
    if (processing.services) {
      processing.services.forEach((service: any) => {
        if (
          service.incentivePoints === null ||
          service.incentivePoints === undefined
        ) {
          service.incentivePoints = 0;
        }
      });
    }
    const serviceChains = await contractService.updateServiceChain(
      contractId,
      chainId,
      processing,
    );
    if (!serviceChains) {
      throw new Error('something went wrong while updating service chain');
    }
    return res.json(serviceChains);
  } catch (error) {
    logger.error('Error while inserting service chain:', error);
    res.status(500).json({
      error: 'An error occurred while while inserting service chain.',
    });
  }
};

export const removeServiceChain = async (req: Request, res: Response) => {
  const contractService = await ContractService.getInstance();
  try {
    const { id: contractId, chainId } = req.params;
    const serviceChains = await contractService.removeServiceChain(
      contractId,
      chainId,
    );
    if (!serviceChains) {
      return res.json({});
    }
    return res.json(serviceChains);
  } catch (error) {
    logger.error('Error while deleting service chain:', error);
    res.status(500).json({
      error: 'An error occurred while deleting service chain.',
    });
  }
};

export const deleteServiceChain = async (req: Request, res: Response) => {
  const contractService = await ContractService.getInstance();
  try {
    const contractId: string = req.params.id;
    const processing = req.body;
    const deletedProcessing = await contractService.deleteServiceChain(
      contractId,
      processing,
    );
    if (!deletedProcessing) {
      throw new Error('something went wrong while deleting service chain');
    }
    return res.json(deletedProcessing);
  } catch (error) {
    logger.error('Error while deleting service chain:', error);
    res.status(500).json({
      error: 'An error occurred while deleting service chain.',
    });
  }
};

/**
 * Get the validated contract by id
 * The body must contain either (resourceId and purposeId) or serviceChainId to validate the contract.
 * The contract must be in a valid state (not revoked or pending) and must contain the specified resource, purpose, or service chain.
 * The participant of the resource or service chain must be a member of the contract.
 * The incoming request must be from a member of the contract.
 * @param req
 * @param res
 */
export const getValidatedContract = async (req: Request, res: Response) => {
  const contractService = await ContractService.getInstance();
  try {
    const contractId: string = req.params.id;
    const { resourceId, purposeId, serviceChainId } = req.body;

    const hasResourceAndPurpose = resourceId && purposeId;
    const hasServiceChain = !!serviceChainId;

    if (!hasResourceAndPurpose && !hasServiceChain) {
      return res.status(400).json({
        error:
          'You must provide either (resourceId and purposeId) or serviceChainId.',
      });
    }

    const contract = await contractService.getContract(contractId);

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }

    if (contract.status === 'revoked') {
      logger.warn(
        `[Contract/Controller: getValidatedContract] Contract ${contractId} is revoked.`,
      );
      return res.status(403).json({
        error: 'Contract is revoked and can no longer be accessed.',
      });
    }

    if (contract.status === 'pending') {
      logger.warn(
        `[Contract/Controller: getValidatedContract] Contract ${contractId} is still pending.`,
      );
      return res.status(403).json({
        error: 'Contract is pending and has not been signed yet.',
      });
    }

    const requesterOrigin =
      (req.headers.origin as string) ||
      (req.headers.referer as string) ||
      null;

    if (!requesterOrigin) {
      return res.status(400).json({
        error: 'Unable to identify the requester: no origin or referer header found.',
      });
    }

    const requesterMember = (contract.members as IContractMember[]).find(
      (m) =>
        m.dataspaceEndpoint &&
        requesterOrigin.startsWith(m.dataspaceEndpoint),
    );

    if (!requesterMember) {
      logger.warn(
        `[Contract/Controller: getValidatedContract] Requester '${requesterOrigin}' is not a member of contract ${contractId}.`,
      );
      return res.status(403).json({
        error: `Requester '${requesterOrigin}' is not a member of this contract.`,
      });
    }

    if (hasResourceAndPurpose) {
      // Find the offering that owns the resource, looking through the legacy
      // generic array, the typed arrays, and any package-scoped resources.
      const offeringWithResource = contract.serviceOfferings.find((offering) => {
        const o = offering as typeof offering &
          IContractOfferingFlattenedFields;
        const holdsResource = (resources?: unknown[]) =>
          (resources ?? []).some(
            (r) => (r as { resourceId?: string })?.resourceId === resourceId,
          );

        return (
          holdsResource(o.resources) ||
          holdsResource(o.dataResources) ||
          holdsResource(o.softwareResources) ||
          (o.packages ?? []).some((pkg) => {
            const p = pkg as IContractOfferingFlattenedFields;
            return (
              holdsResource(p.dataResources) ||
              holdsResource(p.softwareResources)
            );
          })
        );
      });

      if (!offeringWithResource) {
        return res.status(403).json({
          error: `Resource '${resourceId}' was not found in the contract's service offerings.`,
        });
      }

      // Verify the offering's participant is a contract member
      const participantIsMember = contract.members.some(
        (m) => m.participant === offeringWithResource.participant,
      );

      if (!participantIsMember) {
        return res.status(403).json({
          error: `Participant '${offeringWithResource.participant}' of resource '${resourceId}' is not a member of this contract.`,
        });
      }

      // Verify the purpose exists in the contract
      const purposeExists = contract.purpose.some((p) => p.uid === purposeId);

      if (!purposeExists) {
        return res.status(403).json({
          error: `Purpose '${purposeId}' was not found in the contract.`,
        });
      }
    }

    if (hasServiceChain) {
      // Match on either key: `catalogId` is what deployed connectors send.
      const chain = contract.serviceChains.find(
        (c) =>
          c.serviceChainId === serviceChainId ||
          c.catalogId === serviceChainId,
      );

      if (!chain) {
        return res.status(403).json({
          error: `Service chain '${serviceChainId}' was not found in the contract.`,
        });
      }

      // Verify each participant of the chain's services is a contract member
      const memberParticipants = new Set(
        contract.members.map((m) => m.participant),
      );

      const chainParticipants: string[] = (chain.services ?? [])
        .map((s) => (s as { participant?: string })?.participant)
        .filter((p): p is string => Boolean(p));

      const nonMemberParticipant = chainParticipants.find(
        (p) => !memberParticipants.has(p),
      );

      if (nonMemberParticipant) {
        return res.status(403).json({
          error: `Participant '${nonMemberParticipant}' of service chain '${serviceChainId}' is not a member of this contract.`,
        });
      }
    }

    logger.info(
      '[Contract/Controller: getValidatedContract] Successfully called.',
    );
    return res.json(contract);
  } catch (error) {
    logger.error('Error retrieving the validated contract:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while retrieving the contract.' });
  }
};
