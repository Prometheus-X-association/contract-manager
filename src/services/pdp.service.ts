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

  private constructor() {
    // Initialize the singleton instance
  }

  static getInstance(): PDPService {
    if (!PDPService.instance) {
      PDPService.instance = new PDPService();
    }
    return PDPService.instance;
  }

  defineReferencePolicies(policies: IAuthorisationPolicy[]): void {
    //
    this.referencePolicies = policies;
  }

  evalPolicy(policy: IAuthorisationPolicy): boolean {
    // Define the ability based on policies
    const ability = this.defineAbility(this.referencePolicies);
    // Check if the given policy has permission
    console.log(JSON.stringify(policy, null, 2));
    const hasPermission = ability.can(policy.action, {
      constructor: {
        name: policy.subject,
      },
      ...policy.conditions,
    });
    return hasPermission;
  }

  private defineAbility(policies: IAuthorisationPolicy[]): Ability {
    // Create an AbilityBuilder instance
    const { can: allow, build } = new AbilityBuilder<Ability>(PureAbility);
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
