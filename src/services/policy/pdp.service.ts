import {
  AbilityBuilder,
  PureAbility,
  MatchConditions,
  SubjectType,
  mongoQueryMatcher,
} from '@casl/ability';
import {
  PDPAction,
  IAuthorisationPolicy,
  IAuthorisationPolicySet,
  IPolicySet,
} from 'interfaces/policy.interface';
import repository from 'services/data.repository.service';
import { genPolicies } from './utils';
import { logger } from 'utils/logger';
import { mergeConditions } from 'services/policy/utils';

// Define an Ability type
type Ability = PureAbility<
  [PDPAction, Record<any, any> | SubjectType],
  MatchConditions
>;

// Policy Decision Point
class PDPService {
  // Lambda function for custom conditions matching
  private static lambdaMatcher = (matchConditions: MatchConditions) => {
    return matchConditions;
  };

  private static instance: PDPService;
  // private referencePolicies: IAuthorisationPolicy[] = [];
  private authorisationAbility: Ability | undefined;
  private builder: AbilityBuilder<Ability>;
  private constructor() {
    // Initialize the singleton instance
    this.builder = this.getBuilder();
  }

  private getBuilder(): AbilityBuilder<Ability> {
    return new AbilityBuilder<Ability>(PureAbility);
  }

  public static getInstance(): PDPService {
    if (!PDPService.instance) {
      PDPService.instance = new PDPService();
    }
    return PDPService.instance;
  }

  public pushReferencePolicies(
    policies: IAuthorisationPolicy[],
    options: any = { build: true, deny: false },
  ): void {
    this.defineAbility(policies, options.deny === true);
    if (options.build) {
      this.authorisationAbility = this.buildAbility();
    }
  }

  public evalPolicy(
    policy: IAuthorisationPolicy,
    cannot: boolean = false,
  ): boolean {
    if (policy && this.authorisationAbility != undefined) {
      // Check if the given policy has permission
      const constraint = {
        constructor: {
          name: policy.subject,
        },
        ...policy.conditions,
      };
      if (!cannot) {
        return this.authorisationAbility.can(policy.action, constraint);
      }
      return this.authorisationAbility.cannot(policy.action, constraint);
    }
    return false;
  }

  // define ability from authorisation policy
  public defineAbility(
    policies: IAuthorisationPolicy[],
    shouldDeny: boolean = false,
  ): void {
    const { can: allow, cannot: deny } = this.builder;
    // Define permissions based on policies
    policies.forEach((item: IAuthorisationPolicy) => {
      const matchConditions = mongoQueryMatcher(item.conditions);
      if (shouldDeny) {
        deny(
          item.action,
          item.subject,
          /* item.fields,*/
          matchConditions,
        );
      } else {
        allow(
          item.action,
          item.subject,
          /* item.fields,*/
          matchConditions,
        );
      }
    });
  }

  // Build current ability and make sure to generate the next builder
  private buildAbility(): Ability {
    // Build and return the ability using the lambda conditions matcher
    const ability = this.builder.build({
      conditionsMatcher: PDPService.lambdaMatcher,
    });
    // Generate a fresh new builder for the next use
    this.builder = this.getBuilder();
    return ability;
  }

  public isAuthorised(set: IPolicySet, sessionId: string): boolean {
    const evaluator = new PolicyEvaluator(sessionId);
    return evaluator.isAuthorised(set);
  }
}

export class PolicyEvaluator {
  private sessionId: string;
  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  /**
   * Evaluate authorisations of a set using the PDP (Policy Decision Point) service.
   * @param set - Set of authorisations including reference and external authorisations.
   * @returns {boolean} - Returns true if all authorisation policies are valid, otherwise false.
   */
  private evalAuthorisations(set: IAuthorisationPolicySet): boolean {
    // Get an instance of the PDP (Policy Decision Point) service.
    const pdp = PDPService.getInstance();
    // Merge reference and external authorisations for permissions.
    const permissions = mergeConditions(set.permissions);
    // Merge reference and external authorisations for prohibitions.
    const prohibitions = mergeConditions(set.prohibitions);
    // Add reference policies to the PDP service.
    pdp.pushReferencePolicies(permissions, { build: false });
    pdp.pushReferencePolicies(prohibitions, { build: true, deny: true });
    // Generate conditions to evaluate with values from the system from the merge of permissions and prohibitions.
    const policies: IAuthorisationPolicy[] = this.genConditions(
      mergeConditions([...permissions, ...prohibitions]),
    );
    // Evaluate each generated policy with the PDP service and check if they are all valid.
    const validation = policies.every((policy) => {
      const isValid = pdp.evalPolicy(policy);
      return isValid;
    });
    // Return the validation result.
    return validation;
  }

  /**
   * Generate conditions for authorisations, replacing condition values with corresponding system values.
   * @param authorisations - Array of authorisations to be processed.
   * @returns {IAuthorisationPolicy[]} - Array of processed authorisations with replaced condition values.
   */
  private genConditions(
    authorisations: IAuthorisationPolicy[],
  ): IAuthorisationPolicy[] {
    return authorisations.map((authorisation: IAuthorisationPolicy) => {
      const auth = { ...authorisation };
      if (auth?.conditions) {
        auth.conditions = Object.fromEntries(
          Object.entries(auth.conditions).map(([key, value]) => {
            return [key, this.getRightValue(key)];
          }),
        );
      }
      return auth;
    });
  }

  /**
   * Get the correct value from the system based on the provided key.
   * @param key - authorisation condition key.
   * @returns {unknown} - Value corresponding to the provided key from the system.
   */
  private getRightValue(key: string): unknown {
    const [store, name] = key.split(':');
    let value: unknown | null = 0;
    if (name === undefined) {
      value = repository.getValue(store);
    } else if (store === 'user') {
      value = repository.getUserValue(this.sessionId, name);
    } else {
      repository.getStoreValue(store, name);
    }
    return value;
  }

  /**
   * Check if a set of policies is allowed based on the provided policy set.
   * @param set - Policy set containing reference and external policies.
   * @returns {boolean} - Returns true if all policies are allowed, otherwise false.
   */
  public isAuthorised(set: IPolicySet): boolean {
    const authorisationPolicySet: IAuthorisationPolicySet = {
      permissions: genPolicies(set.permission),
      prohibitions: genPolicies(set.prohibition),
    };
    return this.evalAuthorisations(authorisationPolicySet);
  }
}
export default PDPService.getInstance();
