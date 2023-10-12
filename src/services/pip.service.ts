import { PDPAction, IAuthorisationPolicy } from 'interfaces/policy.interface';
import { Request } from 'express';
import session, { Session } from 'express-session';
import policyProviderService from 'services/policy.provider.service';

/**
 * ServicePIP is responsible for managing contextual policies related to the user, etc.
 * This service provides functionality to retrieve user-specific information and other
 * contextual attributes needed for policy evaluation.
 *
 * @remarks
 * The ServicePIP acts as a Point of Information for Policies (PIP), gathering necessary
 * data for the Policy Decision Point (PDP) to make informed decisions regarding access
 * control and policy enforcement.
 */
export class PIPService {
  private static instance: PIPService;
  private policies: Record<string, IAuthorisationPolicy[]> = {};

  private constructor() {}

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

  // Get user policies from the session
  public getUserPolicyFromSession(
    req: Request,
  ): IAuthorisationPolicy[] | undefined {
    const session = (req as any).session as Session;
    return session ? this.policies[session.id] : undefined;
  }

  // Set user policies to the session
  public setUserPolicyToSession(
    req: Request,
    data: IAuthorisationPolicy,
  ): void {
    const session = (req as any).session as Session;
    if (!session) {
      throw new Error('Session is not available.');
    }
    this.policies[session.id] = [data];
  }

  /**
   * Adds one or more new policies form odrl policies to the current user context.
   *
   * This method takes an array of policies and verifies each policy using the
   * policyProviderService. If a policy is valid, it is added to the user's context.
   * If a policy is invalid, it is collected in an array of invalid policies.
   *
   * @param req - The Express Request object containing session information.
   * @param policies - An array of policies to be added to the user context.
   * @returns An array of policies that were not valid and not added to the context.
   *
   * @throws Error if the session is not available in the request.
   *
   * @remarks
   * This method is part of the PIPService (Point of Information for Policies)
   * and is responsible for managing contextual policies related to the user.
   * The policies are added to the user's context only if they are valid,
   * based on the verification provided by the policyProviderService.
   */
  public async addPolicies(req: Request, policies: any[]): Promise<any[]> {
    const session = (req as any).session as Session;
    if (!session) {
      throw new Error('Session is not available.');
    }
    const invalidPolicies: any[] = [];
    for (const policy of policies) {
      const verify = await policyProviderService.verifyOdrlPolicy(policy);
      if (verify) {
        if (!this.policies[session.id]) {
          this.policies[session.id] = [];
        }
        // Todo parse policies
        this.policies[session.id].push(policy);
      } else {
        invalidPolicies.push(policy);
      }
    }
    return invalidPolicies;
  }

  // Remove a policy from the user context
  public removePolicy(req: Request, id: string): void {
    const session = (req as any).session as Session;
    const policies = this.policies[session.id];
    if (!session || !policies) {
      throw new Error('Session or policies not available.');
    }
    const index = policies.findIndex((policy: IAuthorisationPolicy) => {
      // Todo
      return false;
    });
    if (index !== -1) {
      policies.splice(index, 1);
    }
  }
}

export default PIPService.getInstance();
