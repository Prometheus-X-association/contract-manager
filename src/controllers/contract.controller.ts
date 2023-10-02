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
    logger.info(contract);
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
    logger.info('Retrieved contract:', contract);
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
    logger.info('Updated contract:', updatedContract);
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
    logger.info('Contract deleted successfully.');
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
    logger.info('Signed contract:', updatedContract);
    return res.json(updatedContract);
  } catch (error) {
    logger.error('Error signing the contract:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while signing the contract.' });
  }
};
// Check if data is authorized for exploitation
export const checkDataExploitation = async (req: Request, res: Response) => {
  const contractId = req.params.id;
  const data = req.body;
  try {
    const isAuthorized = await contractService.checkPermission(
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
/*
// Get all contrat for a participant
export const getAllContratFor = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const did: string = req.params.did;
    const signedContracts =
      await contractService.getAllSignedContractsByDid(did);
    res.status(200).json({ contracts: signedContracts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
*/
