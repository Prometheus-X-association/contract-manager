import {
  AbilityBuilder,
  PureAbility,
  MatchConditions,
  SubjectType,
  mongoQueryMatcher,
} from '@casl/ability';
import { PDPAction, IAuthorisationPolicy } from 'interfaces/policy.interface';

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
}

export default PDPService.getInstance();
