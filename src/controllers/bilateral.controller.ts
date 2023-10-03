// Ecosystem Contract Controller
import { Request, Response } from 'express';
import {
  IBilateralContract,
  IBilateralContractDB,
} from 'interfaces/contract.interface';
import bilateralContractService from 'services/bilateral.service';
import { logger } from 'utils/logger';
import { BilateralContractSignature } from 'interfaces/schemas.interface';
// Create
export const createContract = async (req: Request, res: Response) => {
  try {
    const contract: IBilateralContract =
      await bilateralContractService.genContract(req.body);
    logger.info('[Contract/Bilateral: createContract] Successfully called.');
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
    const contract = await bilateralContractService.getContract(contractId);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }
    logger.info('[Contract/Bilateral: getContract] Successfully called.');
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
    const updates: Partial<IBilateralContractDB> = req.body;
    const updatedContract = await bilateralContractService.updateContract(
      contractId,
      updates,
    );
    if (!updatedContract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }
    logger.info('[Contract/Bilateral: updateContract] Successfully called.');
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
    await bilateralContractService.deleteContract(contractId);
    logger.info('[Contract/Bilateral: deleteContract] Successfully called.');
    return res.json({ message: 'Contract deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting the contract:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while deleting the contract.' });
  }
};

// Add a negociator/participant to a contrat
export const addContractNegociator = async (req: Request, res: Response) => {
  try {
    const contractId: string = req.params.id;
    const did: string = req.body.did;
    if (!did) {
      return res
        .status(400)
        .json({ error: 'Did is required in the request body.' });
    }
    const updatedContract =
      await bilateralContractService.addContractNegociator(contractId, did);
    //
    logger.info(
      '[Contract/Bilateral: addContractNegociator] Successfully called.',
    );
    return res.json(updatedContract);
  } catch (error: any) {
    logger.error('Error adding contract negotiator:', error);
    res.status(500).json({
      error: 'An error occurred while adding the contract negotiator:',
      message: error.message,
    });
  }
};

// Sign for a given party and signature
export const signContract = async (req: Request, res: Response) => {
  try {
    const contractId: string = req.params.id;
    const signature: BilateralContractSignature = req.body;
    const updatedContract = await bilateralContractService.signContract(
      contractId,
      signature,
    );
    logger.info('[Contract/Bilateral: signContract] Successfully called.');
    return res.json(updatedContract);
  } catch (error: any) {
    logger.error('Error signing the contract:', error);
    res.status(500).json({
      error: 'An error occurred while signing the contract:',
      message: error.message,
    });
  }
};
// Revoke a signature on a contract for a given contract id and party did
export const revokeContractSignature = async (req: Request, res: Response) => {
  return res.json({ message: 'revoke' });
};
// Check if data is authorized for exploitation
export const checkDataExploitation = async (req: Request, res: Response) => {
  const contractId = req.params.id;
  const data = req.body;
  try {
    const isAuthorized = await bilateralContractService.checkPermission(
      contractId,
      data,
    );
    if (isAuthorized) {
      return res.status(200).json({ authorized: true });
    } else {
      return res.status(403).json({ authorized: false });
    }
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
// Get all contrat according to the filter
export const getAllContratFor = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const did: string | undefined = req.query.did?.toString();
    const isParticipant: boolean | undefined =
      req.query.isParticipant === undefined
        ? undefined
        : req.query.isParticipant === 'true';

    const hasSigned: boolean | undefined =
      req.query.hasSigned === undefined
        ? undefined
        : req.query.hasSigned === 'true';

    let contracts: IBilateralContractDB[];
    contracts = await bilateralContractService.getAllContracts(
      did,
      isParticipant,
      hasSigned,
    );

    logger.info('[Contract/Bilateral: getAllContratFor] Successfully called.');
    res.status(200).json({ contracts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
