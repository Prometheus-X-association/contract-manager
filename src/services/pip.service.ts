import { PDPAction, IAuthorisationPolicy } from 'interfaces/policy.interface';
import { Request } from 'express';

// Policy Information Point
class PIPService {
  private static instance: PIPService;

  private constructor() {
    // Initialize the singleton, if needed
  }

  public static getInstance(): PIPService {
    if (!PIPService.instance) {
      PIPService.instance = new PIPService();
    }
    return PIPService.instance;
  }

  public buildAuthenticationPolicy(req: Request): IAuthorisationPolicy {
    // Get URL segments to build the policy
    const urlSegments = req.url.split('/');
    // Create an authorization policy based on request information
    const policy: IAuthorisationPolicy = {
      subject: urlSegments[1],
      action: req.method as PDPAction,
      conditions: {},
    };
    // Temporary conditions
    // Todo: To retrieve from user auth token
    policy.conditions =
      policy.subject === 'user'
        ? {
            task: urlSegments[2],
          }
        : policy.subject === 'contracts'
        ? {
            participant: 'admin',
          }
        : policy.subject === 'bilaterals'
        ? {
            participant: 'admin',
          }
        : {};
    // Return the constructed authorization policy
    return policy;
  }
}

export default PIPService.getInstance();
