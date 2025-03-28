import { Agent, ContractAgent, Logger, MongooseProvider } from 'contract-agent';
import { ContractSchema } from '../models/contract.model';
import { IContractDB } from '../interfaces/contract.interface';

export class ContractAgentService {
  private static instance: ContractAgentService;
  private client: any;
  private signalUpdatePromise: Promise<void>;
  private signalUpdatePromiseResolve: (() => void) | null = null;

  private constructor() {
    this.signalUpdatePromise = new Promise((resolve) => {
      this.signalUpdatePromiseResolve = resolve;
    });
  }

  getSignalUpdatePromise(): Promise<void> {
    return this.signalUpdatePromise;
  }

  genSignalUpdatePromise(): void {
    this.signalUpdatePromise = new Promise((resolve) => {
      this.signalUpdatePromiseResolve = resolve;
    });
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
    agent.signalUpdate = () => {
      if (this.signalUpdatePromiseResolve) {
        this.signalUpdatePromiseResolve();
      }
    };

    /*
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
    */
  }

  private async initialize(): Promise<void> {
    Logger.info('Init contract model through Contract Agent');
    MongooseProvider.setCollectionModel<IContractDB>(
      'contracts',
      ContractSchema,
    );

    Agent.setConfigPath('../../contract-agent.config.json', __filename);

    const contractAgent = await ContractAgent.retrieveService(MongooseProvider);
    if (!contractAgent) {
      throw new Error('Failed to initialize ContractAgent.');
    }

    this.setupAgentMonitoring();

    const provider = contractAgent.getDataProvider(
      'contracts',
    ) as MongooseProvider;

    Logger.info(`Contrat provider set on ${provider.dataSource}`);
  }

  async getMongoosePromise(): Promise<void> {
    const contractAgent = await ContractAgent.retrieveService(MongooseProvider);

    const provider = contractAgent.getDataProvider(
      'contracts',
    ) as MongooseProvider;

    return provider.getMongoosePromise();
  }
}
