import {
  Agent,
  ContractAgent,
  Logger,
  MongoDBProvider,
  MongooseProvider,
} from 'contract-agent';
import Contract from '../models/contract.model';
import mongoose from 'mongoose';
import { IContractDB } from '../interfaces/contract.interface';

export class ContractAgentService {
  private static instance: ContractAgentService;
  // private static mongooseCollection: any;
  private client: any;

  private constructor() {}

  // static setMongooseCollection(collection: any) {
  //   ContractAgentService.mongooseCollection = collection;
  // }

  static setMongooseModel(model: mongoose.Model<IContractDB> | null): void {
    MongooseProvider.setCollectionModel('contracts', model as any);
  }

  static async retrieveService(
    refresh: boolean = false,
  ): Promise<ContractAgentService> {
    if (!ContractAgentService.instance || refresh) {
      const instance = new ContractAgentService();
      await instance.initialize();
      ContractAgentService.instance = instance;
    }
    return ContractAgentService.instance;
  }

  private setupAgentMonitoring() {
    const agent = ContractAgent.prototype as any;
    const handleDataInserted = agent.handleDataInserted;
    const originalHandleDataUpdated = agent.originalHandleDataUpdated;
    const originalHandleDataDeleted = agent.handleDataDeleted;

    agent.handleDataInserted = async function (data: any) {
      Logger.info(`Data inserted: ${JSON.stringify(data, null, 2)}`);
      return await handleDataInserted.call(this, data);
    };

    agent.handleDataUpdated = async function (data: any) {
      Logger.info(`Data updated: ${JSON.stringify(data, null, 2)}`);
      return await originalHandleDataUpdated.call(this, data);
    };

    agent.handleDataDeleted = async function (data: any) {
      Logger.info(`Data deleted: ${JSON.stringify(data, null, 2)}`);
      return await originalHandleDataDeleted.call(this, data);
    };
  }

  private async initialize(): Promise<void> {
    Agent.setConfigPath('../../contract-agent.config.json', __filename);

    const contractAgent = await ContractAgent.retrieveService(MongooseProvider);
    if (!contractAgent) {
      throw new Error('Failed to initialize ContractAgent.');
    }

    this.setupAgentMonitoring();

    const provider = contractAgent.getDataProvider(
      'contracts',
    ) as MongoDBProvider;

    // this.client = provider.getClient();
    // if (!this.client) {
    //   throw new Error('MongoDB client not initialized');
    // }

    // const collection = provider.getCollection();
    // if (!collection) {
    //   throw new Error('MongoDB collection not initialized');
    // }
  }

  getClient(): any {
    return this.client;
  }
}
