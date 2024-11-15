// Ecosystem Contract Controller
import { Request, Response } from 'express';
import { IContract, IContractDB } from 'interfaces/contract.interface';
import contractService from 'services/contract.service';
import { logger } from 'utils/logger';
import { ContractMember } from 'interfaces/schemas.interface';
import { validationResult } from 'express-validator';

export const createContract = async (req: Request, res: Response) => {
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

export const getDataProcessings = async (req: Request, res: Response) => {
  try {
    const contractId: string = req.params.id;
    const dataProcessings =
      await contractService.getDataProcessings(contractId);
    if (!dataProcessings) {
      return res.json([]);
    }
    return res.json(dataProcessings);
  } catch (error) {
    logger.error('Error retrieving the data processings:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while retrieving data processings.' });
  }
};

export const writeDataProcessings = async (req: Request, res: Response) => {
  try {
    const contractId: string = req.params.id;
    const processings = req.body;
    const dataProcessings = await contractService.writeDataProcessings(
      contractId,
      processings,
    );
    if (!dataProcessings) {
      throw new Error('something went wrong while writing data processings');
    }
    return res.json(dataProcessings);
  } catch (error) {
    logger.error('Error while writing data processings:', error);
    res.status(500).json({
      error: 'An error occurred while while writing data processings.',
    });
  }
};

export const insertDataProcessing = async (req: Request, res: Response) => {
  try {
    const { id: contractId } = req.params;
    const processing = req.body;
    const dataProcessings = await contractService.insertDataProcessing(
      contractId,
      processing,
    );
    if (!dataProcessings) {
      throw new Error('something went wrong while insering data processing.');
    }
    return res.json(dataProcessings);
  } catch (error) {
    logger.error('Error while inserting data processing:', error);
    res.status(500).json({
      error: 'An error occurred while inserting data processing.',
    });
  }
};

export const updateDataProcessing = async (req: Request, res: Response) => {
  try {
    const { id: contractId, processingId } = req.params;
    const processing = req.body;
    const dataProcessings = await contractService.updateDataProcessing(
      contractId,
      processingId,
      processing,
    );
    if (!dataProcessings) {
      throw new Error('something went wrong while updating data processing');
    }
    return res.json(dataProcessings);
  } catch (error) {
    logger.error('Error while inserting data processing:', error);
    res.status(500).json({
      error: 'An error occurred while while inserting data processing.',
    });
  }
};

export const removeDataProcessing = async (req: Request, res: Response) => {
  try {
    const { id: contractId, processingId } = req.params;
    const dataProcessings = await contractService.removeDataProcessing(
      contractId,
      processingId,
    );
    if (!dataProcessings) {
      throw new Error('something went wrong while deleting data processing');
    }
    return res.json(dataProcessings);
  } catch (error) {
    logger.error('Error while deleting data processing:', error);
    res.status(500).json({
      error: 'An error occurred while deleting data processing.',
    });
  }
};

export const deleteDataProcessing = async (req: Request, res: Response) => {
  try {
    const contractId: string = req.params.id;
    const processing = req.body;
    const deletedProcessing = await contractService.deleteDataProcessing(
      contractId,
      processing,
    );
    if (!deletedProcessing) {
      throw new Error('something went wrong while deleting data processing');
    }
    return res.json(deletedProcessing);
  } catch (error) {
    logger.error('Error while deleting data processing:', error);
    res.status(500).json({
      error: 'An error occurred while deleting data processing.',
    });
  }
};
