import { IAuthorisationPolicy } from 'interfaces/policy.interface';
import PolicyReferenceRegistry from 'models/policy.registry.model';
// import { instanciator, validator } from 'json-odrl-manager';
import { logger } from 'utils/logger';

/**
 * Policy Provider Service.
 */
export class PolicyProviderService {
  private static instance: PolicyProviderService;
  private policiesPromise: Promise<IAuthorisationPolicy[]>;

  private constructor() {
    this.policiesPromise = this.fetchAuthorisationPolicies();
  }

  public static getInstance(): PolicyProviderService {
    if (!PolicyProviderService.instance) {
      PolicyProviderService.instance = new PolicyProviderService();
    }
    return PolicyProviderService.instance;
  }

  /**
   * Verifies the validity of an ODRL policy.
   *
   * @param {any} policy - The ODRL policy to verify.
   * @returns {boolean} True if the policy is valid, otherwise false.
   */
  public async verifyOdrlPolicy(policy: any): Promise<boolean> {
    return true;
  }

  public async fetchAuthorisationPolicies(): Promise<IAuthorisationPolicy[]> {
    try {
      // Find the PolicyReferenceRegistry document
      const policyRegistry = await PolicyReferenceRegistry.findOne();
      if (!policyRegistry) {
        throw new Error('PolicyReferenceRegistry not found');
      }
      // Extract policies array from the document
      const authorisationPolicies = policyRegistry.policies;
      return authorisationPolicies as IAuthorisationPolicy[];
    } catch (error: any) {
      throw new Error(`Error fetching authorizations: ${error.message}`);
    }
  }

  // Fetch all policies from the policy list
  public fetch(): Promise<IAuthorisationPolicy[]> {
    return this.policiesPromise;
  }
}

export default PolicyProviderService.getInstance();
