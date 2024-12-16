import { Agent, ContractAgent, Logger, MongoDBProvider } from 'contract-agent';

export class ContractAgentService {
  private static instance: ContractAgentService;
  private client: any;
  private collection: any;

  private constructor() {}

  /**
   * Retrieves or creates an instance of ContractAgentService.
   * @param refresh - Whether to force creation of a new instance.
   * @returns Instance of ContractAgentService.
   */
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

    const contractAgent = await ContractAgent.retrieveService();
    if (!contractAgent) {
      throw new Error('Failed to initialize ContractAgent.');
    }

    this.setupAgentMonitoring();

    const provider = contractAgent.getDataProvider(
      'contracts',
    ) as MongoDBProvider;

    this.client = provider.getClient();
    if (!this.client) {
      throw new Error('MongoDB client not initialized');
    }

    this.collection = provider.getCollection();

    if (!this.collection) {
      throw new Error('MongoDB collection not initialized');
    }
  }

  getClient(): any {
    return this.client;
  }

  getCollection(): any {
    return this.collection;
  }
}
