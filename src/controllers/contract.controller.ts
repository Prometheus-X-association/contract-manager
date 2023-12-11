// Ecosystem Contract Controller
import { Request, Response } from 'express';
import { IContract, IContractDB } from 'interfaces/contract.interface';
import contractService from 'services/contract.service';
import { logger } from 'utils/logger';
import { ContractMember } from 'interfaces/schemas.interface';

export const createContract = async (req: Request, res: Response) => {
  try {
    const contract: IContract = await contractService.genContract(req.body);
    logger.info('[Contract/Controller: createContract] Successfully called.');
    return res.status(201).json(contract);
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

export const checkDataExploitation = async (req: Request, res: Response) => {
  const contractId = req.params.id;
  const data = { policy: req.body };
  const sessionId = req.session.id;
  try {
    const isAuthorised = await contractService.checkPermission(
      contractId,
      data,
      sessionId,
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

export const getODRLContract = async (req: Request, res: Response) => {
  try {
    const contractId: string = req.params.id;
    const contract = await contractService.getODRLContract(contractId, false);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }
    logger.info('[Contract/Controller: getODRLContract] Successfully called.');
    return res.json(contract);
  } catch (error) {
    logger.error('Error retrieving the ODRL contract:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while retrieving the ODRL contract.' });
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
    const { serviceOffering, policies } = req.body;
    if (contractId && serviceOffering && policies) {
      const updatedContract = await contractService.addOfferingPolicies(
        contractId,
        serviceOffering,
        policies,
      );
      res.status(200).json({ contract: updatedContract });
    } else {
      throw new Error('Invalid paylaod.');
    }
  } catch (error) {
    logger.error(
      '[Contract/injectOfferingPolicies]: Error while injecting offering policies:',
      error,
    );
    const message = (error as Error).message;
    res.status(500).json({ error: message });
  }
};
