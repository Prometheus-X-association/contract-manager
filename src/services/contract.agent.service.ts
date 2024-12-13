import { Agent, ContractAgent, MongoDBProvider } from 'contract-agent';

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

  private async initialize(): Promise<void> {
    const contractAgent = await ContractAgent.retrieveService();
    if (!contractAgent) {
      throw new Error('Failed to initialize ContractAgent.');
    }

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
