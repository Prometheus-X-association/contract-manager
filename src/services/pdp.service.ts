import {
  AbilityBuilder,
  PureAbility,
  MatchConditions,
  SubjectType,
} from '@casl/ability';

// Define custom types and interfaces
export type PDPAction = /*'POST' | 'GET' |*/ 'UPDATE' | 'DELETE';

export interface PDPPolicy {
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

// Define the ability based on provided policies
const defineAbility = (policies: PDPPolicy[]) => {
  // Condition function for checking policies
  const condition =
    (item: PDPPolicy) =>
    ({ conditions }: { conditions: any | undefined }): boolean => {
      if (conditions !== undefined) {
        const keys = Object.keys(conditions);
        return keys.every((key) => {
          if (item.conditions !== undefined) {
            return conditions[key] === item.conditions[key];
          }
          return false;
        });
      }
      return true;
    };

  // Create an AbilityBuilder instance
  const { can: allow, build } = new AbilityBuilder<Ability>(PureAbility);

  // Define permissions based on policies
  policies.forEach((item: PDPPolicy) => {
    allow(item.action, item.subject, /*item.fields,*/ condition(item));
  });

  // Build and return the ability using the lambda conditions matcher
  return build({ conditionsMatcher: lambdaMatcher });
};

// Evaluate a policy to check permissions
const evalPolicy = async (policy: PDPPolicy) => {
  // Temporary static policies for testing
  const policies: PDPPolicy[] = [
    {
      subject: 'contract',
      action: 'DELETE',
      conditions: {
        message: 'hello',
      },
      /*
      fields: [],
      */
    },
  ];

  // Define the ability based on policies
  const ability = defineAbility(policies);

  // Check if the given policy has permission
  const hasPermission = ability.can(policy.action, {
    constructor: {
      name: policy.subject,
    },
    ...policy,
  });

  console.log(hasPermission);
  return false;
};

export default { evalPolicy };
