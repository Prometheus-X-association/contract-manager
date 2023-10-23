import {
  AbilityBuilder,
  PureAbility,
  MatchConditions,
  SubjectType,
  mongoQueryMatcher,
} from '@casl/ability';
import { PDPAction, IAuthorisationPolicy } from 'interfaces/policy.interface';
import { genInputPolicies, genPolicies } from './utils';

// Define an Ability type
type Ability = PureAbility<
  [PDPAction, Record<any, any> | SubjectType],
  MatchConditions
>;

// Lambda function for custom conditions matching
const lambdaMatcher = (matchConditions: MatchConditions) => {
  return matchConditions;
};

// Policy Decision Point
class PDPService {
  private static instance: PDPService;
  private referencePolicies: IAuthorisationPolicy[] = [];
  private authorisationAbility: Ability;

  private constructor() {
    // Initialize the singleton instance
    const { can, build } = this.getBuilder();
    this.authorisationAbility = build();
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

  public defineReferencePolicies(policies: IAuthorisationPolicy[]): void {
    this.referencePolicies = policies;
    this.authorisationAbility = this.defineAbility(this.referencePolicies);
  }

  public evalPolicy(
    policy: IAuthorisationPolicy,
    cannot: boolean = false,
  ): boolean {
    if (policy) {
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

  private defineAbility(policies: IAuthorisationPolicy[]): Ability {
    // Create an AbilityBuilder instance
    const { can: allow, build } = this.getBuilder();
    // Define permissions based on policies
    policies.forEach((item: IAuthorisationPolicy) => {
      const matchConditions = mongoQueryMatcher(item.conditions);
      const m = mongoQueryMatcher({ age: { $gt: 17 } });
      allow(
        item.action,
        item.subject,
        /*item.fields,*/
        matchConditions,
      );
    });
    // Build and return the ability using the lambda conditions matcher
    return build({ conditionsMatcher: lambdaMatcher });
  }

  // Helper function to check a constraint
  private checkConstraint(constraint: any): boolean {
    // Create an authorization policy based on the current constraint
    const contractPolicies: IAuthorisationPolicy[] = genPolicies(
      constraint.reference,
    );
    // Evaluate the authorization policy
    this.defineReferencePolicies(contractPolicies);
    // Generate internal policies based on input values without considering operators in constraints
    const inputPolicies: IAuthorisationPolicy[] = genInputPolicies(
      constraint.input,
    );
    // Check if each input policy is authorized
    const validation = inputPolicies.every((policy) =>
      this.evalPolicy(policy, constraint.cannot),
    );
    return validation;
  }

  public isAuthorised(constraints: any[]) {
    return constraints.every((constraint) => this.checkConstraint(constraint));
  }
}

export default PDPService.getInstance();
