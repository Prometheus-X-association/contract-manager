import { IPolicySet } from 'interfaces/policy.interface';
import {
  instanciator,
  evaluator,
  Custom,
  PolicyDataFetcher,
} from 'json-odrl-manager';
import repository from 'services/store.service';
class PDPFetcher extends PolicyDataFetcher {
  public sessionId: string;
  constructor() {
    super();
    this.sessionId = '';
  }

  @Custom()
  protected async getRole(): Promise<string> {
    const role = repository.getUserValue(this.sessionId, 'role');
    return role as string;
  }

  @Custom()
  protected async getAge(): Promise<number> {
    const age = repository.getUserValue(this.sessionId, 'age');
    return age as number;
  }
}

// Policy Decision Point
class PDPService {
  private static instance: PDPService;
  private static fetcher: PDPFetcher;
  private constructor() {
    PDPService.fetcher = new PDPFetcher();
  }

  public static getInstance(): PDPService {
    if (!PDPService.instance) {
      PDPService.instance = new PDPService();
    }
    return PDPService.instance;
  }

  public async isAuthorised(
    set: IPolicySet,
    sessionId: string,
    json: any,
  ): Promise<boolean> {
    const base = {
      '@type': 'Set',
      '@context': 'http://www.w3.org/ns/odrl/2/',
      ...set,
    };
    const policy = instanciator.genPolicyFrom(base);
    if (policy) {
      evaluator.setPolicy(policy, PDPService.fetcher);
      PDPService.fetcher.sessionId = sessionId;
      return await evaluator.evalResourcePerformabilities(json);
    } else {
      throw new Error('Something went wrong in policy object generation');
    }
  }
}

export default PDPService.getInstance();
