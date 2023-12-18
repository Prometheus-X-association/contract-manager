import { IPolicySet } from 'interfaces/policy.interface';
import {
  instanciator,
  evaluator,
  ContextFetcher,
  Custom,
} from 'json-odrl-manager';
import repository from 'services/store.service';
import { logger } from 'utils/logger';
class PDPFetcher extends ContextFetcher {
  constructor() {
    super();
  }
  // tmp
  @Custom()
  protected async getAge(): Promise<number> {
    return repository.getStoreValue('user', 'age', '?') as number;
  }
}

// Policy Decision Point
class PDPService {
  private static instance: PDPService;
  private constructor() {
    const fetcher = new PDPFetcher();
    evaluator.setFetcher(fetcher);
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
      evaluator.setPolicy(policy);
      return await evaluator.evalResourcePerformabilities(json);
    } else {
      throw new Error('Something went wrong in policy object generation');
    }
  }
}

export default PDPService.getInstance();
