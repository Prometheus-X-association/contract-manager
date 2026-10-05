import { Request, Response } from 'express';
import { IDSPContract } from 'interfaces/schemas.interface';
import { DSPService } from 'services/dsp.service';
import { logger } from 'utils/logger';

export const createDSPContract = async (req: Request, res: Response) => {
  const contractService = await DSPService.getInstance();
  try {
    const { contract } = req.body;
    if (contract) {
      const generated: IDSPContract =
        await contractService.genContract(contract);

      logger.info(
        '[DSPContract/Controller: createDSPContract] Successfully called.',
      );
      return res.status(201).json(generated);
    } else {
      logger.error(
        '[DSPContract/Controller: createDSPContract] Contract is undefined in request body',
      );
      throw new Error('Input contract undefined');
    }
  } catch (error: any) {
    logger.error('[DSPContract/Controller: createDSPContract] Error:', error);
    res.status(500).json({
      message: 'Failed to create DSP contract',
      error: error.message,
    });
  }
};

export const getDSPContract = async (req: Request, res: Response) => {
  const contractService = await DSPService.getInstance();
  try {
    const { id } = req.params;
    const contract = await contractService.getContract(id);
    if (!contract) {
      return res.status(404).json({ error: 'DSP Contract not found' });
    }
    logger.info(
      '[DSPContract/Controller: getDSPContract] Successfully called.',
    );
    return res.json(contract);
  } catch (error: any) {
    logger.error('[DSPContract/Controller: getDSPContract]:', error);
    res.status(500).json({
      message: 'Failed to retrieve DSPCNP contract',
      error: error.message,
    });
  }
};

export const getDSPContractByAgreementId = async (
  req: Request,
  res: Response,
) => {
  const contractService = await DSPService.getInstance();
  try {
    const { id } = req.params;
    const contract = await contractService.getContractByAgreementId(id);
    if (!contract) {
      return res.status(404).json({ error: 'DSP Contract not found' });
    }
    logger.info(
      '[DSPContract/Controller: getDSPContractByAgreementId] Successfully called.',
    );
    return res.json(contract);
  } catch (error: any) {
    logger.error(
      '[DSPContract/Controller: getDSPContractByAgreementId]:',
      error,
    );
    res.status(500).json({
      message: 'Failed to retrieve DSP contract by agreement ID',
      error: error.message,
    });
  }
};

export const updateDSPContract = async (req: Request, res: Response) => {
  const contractService = await DSPService.getInstance();
  try {
    const { id } = req.params;
    const updates: Partial<IDSPContract> = req.body;
    const updatedContract = await contractService.updateContract(id, updates);
    if (!updatedContract) {
      return res.status(404).json({ error: 'DSPCNP Contract not found' });
    }

    logger.info(
      '[DSPCNPContract/Controller: updateDSPContract] Successfully called.',
    );
    return res.json(updatedContract);
  } catch (error) {
    logger.error('Error updating the DSPCNP contract:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while updating the contract.' });
  }
};

export const deleteDSPContract = async (req: Request, res: Response) => {
  const contractService = await DSPService.getInstance();
  try {
    const { id } = req.params;
    await contractService.deleteContract(id);
    logger.info(
      '[DSPContract/Controller: deleteDSPContract] Successfully called.',
    );
    return res.json({ message: 'DSP Contract deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting the DSP contract:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while deleting the DSP contract.' });
  }
};

export const getContracts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const contractService = await DSPService.getInstance();
  try {
    const contracts: IDSPContract[] = await contractService.getContracts();
    logger.info('[DSPContract/Controller: getContracts] Successfully called.');
    res.status(200).json({ contracts: contracts });
  } catch (error: any) {
    logger.error('Error while fetching all DSP contracts:', { error });
    res.status(500).json({ error: error.message });
  }
};

export const getAllDspContractForParticipant = async (
  req: Request,
  res: Response,
) => {
  const contractService = await DSPService.getInstance();
  try {
    const { id } = req.params;
    const contracts = await contractService.getAllDspContractForParticipant(id);
    logger.info(
      '[DSPContract/Controller: getAllDspContractForParticipant] Successfully called.',
    );
    res.status(200).json({ contracts: contracts });
  } catch (error: any) {
    logger.error('Error while fetching all DSP contracts:', { error });
    res.status(500).json({ error: error.message });
  }
};

export const checkConsumerPidExists = async (req: Request, res: Response) => {
  try {
    const { consumerPid } = req.params;
    const contractService = await DSPService.getInstance();
    const exists = await contractService.checkConsumerPidExists(consumerPid);
    logger.info(
      '[DSPContract/Controller: checkConsumerPidExists] Successfully called.',
    );
    res.status(200).json({ exists });
  } catch (error: any) {
    logger.error('Error while checking if consumerPid exists:', { error });
    res.status(500).json({ error: error.message });
  }
};
