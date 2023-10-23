import { IAuthorisationPolicy } from 'interfaces/policy.interface';
import PolicyReferenceRegistry from 'models/policy.registry.model';
import Ajv from 'ajv';
import { logger } from 'utils/logger';
import { IDataRegistry, IDataRegistryDB } from 'interfaces/global.interface';
import DataRegistry from 'models/data.registry.model';

/**
 * Policy Provider Service.
 */
export class PolicyProviderService {
  private static instance: PolicyProviderService;
  private policiesPromise: Promise<IAuthorisationPolicy[]>;
  private validateFunctions: Function[];
  private odrlValidationSchemaPromise: Promise<IDataRegistry[]>;

  private constructor() {
    this.policiesPromise = this.fetchAuthorisationPolicies();
    this.odrlValidationSchemaPromise = this.getOdrlValidationSchema();
    this.validateFunctions = [];
  }

  public static getInstance(): PolicyProviderService {
    if (!PolicyProviderService.instance) {
      PolicyProviderService.instance = new PolicyProviderService();
    }
    return PolicyProviderService.instance;
  }

  private async getOdrlValidationSchema(): Promise<IDataRegistry[]> {
    try {
      const dataRegistry: IDataRegistryDB | null =
        await DataRegistry.findOne().select('policies.odrlValidationSchema');
      if (dataRegistry) {
        const odrlValidationSchema =
          dataRegistry.policies?.odrlValidationSchema;
        if (odrlValidationSchema) {
          return JSON.parse(odrlValidationSchema);
        } else {
          throw new Error('No odrl validation schema found in database');
        }
      } else {
        throw new Error(
          '[PProvider/Service, getOdrlValidationSchema]: Something went wrong while fetching data from registry',
        );
      }
    } catch (error: any) {
      logger.error(error.message);
      throw error;
    }
  }

  private async initializeValidateFunctions(): Promise<void> {
    const odrlSchemas = await this.odrlValidationSchemaPromise;
    const ajv = new Ajv();
    this.validateFunctions = odrlSchemas.map((schema: any) =>
      ajv.compile(schema),
    );
  }

  /**
   * Verifies the validity of an ODRL policy.
   *
   * @param {any} policy - The ODRL policy to verify.
   * @returns {boolean} True if the policy is valid, otherwise false.
   */
  public async verifyOdrlPolicy(policy: any): Promise<boolean> {
    if (this.validateFunctions.length === 0) {
      await this.initializeValidateFunctions();
    }
    return this.validateFunctions.some((validateFunction) =>
      validateFunction(policy),
    );
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
