import { logger } from 'utils/logger';
import DSPModel from 'models/dsp.model';
import { IDSPContract } from 'interfaces/schemas.interface';
import { IDSPContractDB } from 'interfaces/contract.interface';

export class DSPService {
  private static instance: DSPService;

  private constructor() {}

  public static async getInstance(): Promise<DSPService> {
    if (!DSPService.instance) {
      DSPService.instance = new DSPService();
    }
    return DSPService.instance;
  }

  public async genContract(contractData: IDSPContract): Promise<IDSPContract> {
    try {
      const date = new Date();

      const newCNPContract = new DSPModel({
        ...contractData,
        createdAt: date,
        updatedAt: date,
      });

      return newCNPContract.save() as Promise<IDSPContract>;
    } catch (error: any) {
      logger.error('[DSPService] Error generating CNP contract:', error);
      throw error;
    }
  }

  public async getContract(contractId: string): Promise<IDSPContractDB | null> {
    try {
      return await DSPModel.findById(contractId).lean();
    } catch (error) {
      logger.error('[DSPService, getContract]:', error);
      throw error;
    }
  }

  public async getContractByAgreementId(
    agreementId: string,
  ): Promise<IDSPContractDB | null> {
    try {
      return await DSPModel.findOne({
        agreement: {
          '@id': agreementId,
        },
      }).lean();
    } catch (error) {
      logger.error('[DSPService, getContractByAgreementId]:', error);
      throw error;
    }
  }

  public async updateContract(
    consumerPid: string,
    updates: Partial<IDSPContract>,
  ): Promise<IDSPContractDB | null> {
    try {
      const updatedContract = await DSPModel.findOneAndUpdate(
        { consumerPid },
          {
            ...updates,
            updatedAt: new Date(),
          },
        { new: true },
      ).lean();

      if (!updatedContract) {
        throw new Error(
          `DSP Contract with consumerPid ${consumerPid} not found`,
        );
      }

      return updatedContract;
    } catch (error) {
      logger.error('[DSPService, updateContract]:', error);
      throw error;
    }
  }

  public async deleteContract(consumerPid: string): Promise<void> {
    try {
      const deletedContract = await DSPModel.findOneAndDelete({
        consumerPid,
      });
      if (!deletedContract) {
        throw new Error(
          `DSP Contract with consumerPid ${consumerPid} not found`,
        );
      }
    } catch (error) {
      logger.error('[DSPService, deleteContract]:', error);
      throw error;
    }
  }

  public async getContracts(): Promise<IDSPContractDB[]> {
    try {
      const contracts = await DSPModel.find().lean();
      return contracts;
    } catch (error: any) {
      logger.error('[DSPService, getContracts]:', error);
      throw new Error(`Error while retrieving contracts: ${error.message}`);
    }
  }

  public async getAllDspContractForParticipant(
    participantId: string,
  ): Promise<IDSPContractDB[]> {
    try {
      const contracts = await DSPModel.find({
        $or: [
          { consumerPid: { $regex: `^${participantId}_` } },
          { providerPid: { $regex: `^${participantId}_` } },
        ],
      }).lean();
      return contracts;
    } catch (error: any) {
      logger.error('[DSPService, getAllDspContractForParticipant]:', error);
      throw new Error(
        `Error while retrieving participant ${participantId} contracts: ${error.message}`,
      );
    }
  }

  public async checkConsumerPidExists(consumerPid: string): Promise<boolean> {
    try {
      const contract = await DSPModel.exists({ consumerPid });
      return !!contract;
    } catch (error: any) {
      logger.error('[DSPService, checkConsumerPidExists]:', error);
      throw new Error(
        `Error while checking if consumerPid exists: ${error.message}`,
      );
    }
  }
}
