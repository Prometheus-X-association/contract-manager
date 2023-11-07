// Ecosystem Contract Controller
import { Request, Response } from 'express';
import { IContract, IContractDB } from 'interfaces/contract.interface';
import contractService from 'services/contract.service';
import { logger } from 'utils/logger';
import { ContractSignature } from 'interfaces/schemas.interface';
// Create
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
// Read
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
// Update
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
// Delete
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
// Sign for a given party and signature
export const signContract = async (req: Request, res: Response) => {
  try {
    const contractId: string = req.params.id;
    const signature: ContractSignature = req.body;
    const updatedContract = await contractService.signContract(
      contractId,
      signature,
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
// Revoke a signature on a contract for a given contract id and party did
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
// Check if data is authorized for exploitation
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
// Get contrats for a specific DID with optional filter
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
// Get all contrats
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
// get ODRL contract
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

export const injectPolicy = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const policyId: string = req.body.policyId;
    const contractId: string = req.params.id;
    const updatedContract = await contractService.addPolicyFromId(
      contractId,
      policyId,
    );
    res.status(200).json({ contract: updatedContract });
  } catch (error) {
    logger.error('Error while injecting policy:', error);
    const message = (error as Error).message;
    res.status(500).json({ error: message });
  }
};
