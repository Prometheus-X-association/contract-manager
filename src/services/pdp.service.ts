import {
  AbilityBuilder,
  PureAbility,
  MatchConditions,
  SubjectType,
  mongoQueryMatcher,
} from '@casl/ability';

// Define custom types and interfaces
export type PDPAction = 'POST' | 'GET' | 'PUT' | 'DELETE';

export interface AuthorizationPolicy {
  dbId?: string;
  subject: string;
  action: PDPAction;
  conditions?: any;
  fields?: [];
}

// Define an Ability type
type Ability = PureAbility<
  [PDPAction, Record<any, any> | SubjectType],
  MatchConditions
>;

// Lambda function for custom conditions matching
const lambdaMatcher = (matchConditions: MatchConditions) => {
  return matchConditions;
};

class PDPService {
  private static instance: PDPService;
  private referencePolicies: AuthorizationPolicy[] = [];

  private constructor() {
    // Initialize the singleton instance
  }

  static getInstance(): PDPService {
    if (!PDPService.instance) {
      PDPService.instance = new PDPService();
    }
    return PDPService.instance;
  }

  defineReferencePolicies(policies: AuthorizationPolicy[]): void {
    this.referencePolicies = policies;
  }

  evalPolicy(policy: AuthorizationPolicy): boolean {
    // Define the ability based on policies
    const ability = this.defineAbility(this.referencePolicies);
    // Check if the given policy has permission
    const hasPermission = ability.can(policy.action, {
      constructor: {
        name: policy.subject,
      },
      ...policy.conditions,
    });
    return hasPermission;
  }

  private defineAbility(policies: AuthorizationPolicy[]): Ability {
    // Create an AbilityBuilder instance
    const { can: allow, build } = new AbilityBuilder<Ability>(PureAbility);
    // Define permissions based on policies
    policies.forEach((item: AuthorizationPolicy) => {
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
const pdp = PDPService.getInstance();

export default pdp;
