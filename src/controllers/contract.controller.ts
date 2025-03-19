// Ecosystem Contract Controller
import { Request, Response } from 'express';
import { IContract, IContractDB } from 'interfaces/contract.interface';
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
    const contracts: IContractDB[] = await contractService.getContractsFor(
      did,
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
      const updatedContract = await contractService.addOfferingPolicies(
        contractId,
        serviceOffering,
        participant,
        policies,
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
    const serviceChains =
      await contractService.getServiceChains(contractId);
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
