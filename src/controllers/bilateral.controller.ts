// Ecosystem Contract Controller
import { Request, Response } from 'express';
import {
  IBilateralContract,
  IBilateralContractDB,
} from 'interfaces/contract.interface';
import bilateralContractService from 'services/bilateral.service';
import { logger } from 'utils/logger';
import { BilateralContractSignature } from 'interfaces/schemas.interface';

export const createContract = async (req: Request, res: Response) => {
  // #swagger.tags = ['Bilateral'];
  try {
    const { contract, _no_negociators } = req.body;
    if (!_no_negociators) {
      contract.negotiators = [
        { did: contract.dataConsumer },
        { did: contract.dataProvider },
      ];
    }
    const bilateral: IBilateralContract =
      await bilateralContractService.genContract(contract);
    logger.info('[Bilateral/Controller: createContract] Successfully called.');
    return res.status(201).json(bilateral);
  } catch (error: any) {
    res.status(500).json({
      message: `An error occurred while creating the contract.`,
      error: error.message,
    });
  }
};

export const getContract = async (req: Request, res: Response) => {
  // #swagger.tags = ['Bilateral'];
  try {
    const contractId: string = req.params.id;
    const contract = await bilateralContractService.getContract(contractId);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }
    logger.info('[Bilateral/Controller: getContract] Successfully called.');
    return res.json(contract);
  } catch (error) {
    logger.error('Error retrieving the contract:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while retrieving the contract.' });
  }
};

export const updateContract = async (req: Request, res: Response) => {
  // #swagger.tags = ['Bilateral'];
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
    logger.info('[Bilateral/Controller: updateContract] Successfully called.');
    return res.json(updatedContract);
  } catch (error) {
    logger.error('Error updating the contract:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while updating the contract.' });
  }
};

export const deleteContract = async (req: Request, res: Response) => {
  // #swagger.tags = ['Bilateral'];
  try {
    const contractId: string = req.params.id;
    await bilateralContractService.deleteContract(contractId);
    logger.info('[Bilateral/Controller: deleteContract] Successfully called.');
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
  // #swagger.tags = ['Bilateral'];
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
      '[Bilateral/Controller: addContractNegociator] Successfully called.',
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
  // #swagger.tags = ['Bilateral'];
  try {
    const contractId: string = req.params.id;
    const signature: BilateralContractSignature = req.body;
    const updatedContract = await bilateralContractService.signContract(
      contractId,
      signature,
    );
    logger.info('[Bilateral/Controller: signContract] Successfully called.');
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
  const { id, did } = req.params;
  // #swagger.tags = ['Bilateral'];
  try {
    const revokedSignature =
      await bilateralContractService.revokeSignatureService(id, did);
    logger.info(
      '[Bilateral/Controller: revokeContractSignature] Successfully called.',
    );
    return res.status(200).json(revokedSignature);
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Check if data is authorized for exploitation
export const checkDataExploitation = async (req: Request, res: Response) => {
  // #swagger.tags = ['Bilateral'];
  const contractId = req.params.id;
  const data = { policy: req.body };
  const sessionId = req.session.id;
  try {
    const isAuthorised = await bilateralContractService.checkPermission(
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

// Get contrats for a specific DID and optional filter
export const getContractsFor = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // #swagger.tags = ['Bilateral'];
  try {
    const did: string | undefined = req.params.did;
    const isParticipant: boolean | undefined =
      req.query.isParticipant === undefined
        ? undefined
        : req.query.isParticipant === 'true';

    const hasSigned: boolean | undefined =
      req.query.hasSigned === undefined
        ? undefined
        : req.query.hasSigned === 'true';

    let contracts: IBilateralContractDB[];
    contracts = await bilateralContractService.getContractsFor(
      did,
      isParticipant,
      hasSigned,
    );
    logger.info(
      '[Bilateral/Controller: getAllContratFor] Successfully called.',
    );
    res.status(200).json({ contracts });
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
  // #swagger.tags = ['Bilateral'];
  try {
    const status = req.query.status ? String(req.query.status) : undefined;
    const contracts: IBilateralContractDB[] =
      await bilateralContractService.getContracts(status);
    logger.info('[Bilateral/Controller: getAllContracts] Successfully called.');
    res.status(200).json({ contracts: contracts });
  } catch (error: any) {
    logger.error('Error while fetching all contracts:', { error });
    res.status(500).json({
      message: 'Error while fetching contracts.',
      error: error.message,
    });
  }
};

export const injectPolicies = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const contractId: string = req.params.id;
    const updatedContract = await bilateralContractService.addPolicies(
      contractId,
      req.body,
    );
    res.status(200).json({ contract: updatedContract });
  } catch (error) {
    logger.error('Error while injecting policy:', error);
    const message = (error as Error).message;
    res.status(500).json({ error: message });
  }
};

export const injectPolicy = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // #swagger.tags = ['Bilateral'];
  try {
    const policyId: string = req.body.policyId;
    const contractId: string = req.params.id;
    const replacement: any = req.body.values;
    const updatedContract = await bilateralContractService.addPolicyFromId(
      contractId,
      policyId,
      replacement,
    );
    res.status(200).json({ contract: updatedContract });
  } catch (error) {
    logger.error('Error while injecting policy:', error);
    const message = (error as Error).message;
    res.status(500).json({ error: message });
  }
};
