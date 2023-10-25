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
    return evaluator.isAllowing(set);
  }
}

class PolicyEvaluator {
  private sessionId: string;
  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }
  private evalAuthorisations(set: IAuthorisationPolicySet): boolean {
    const pdp = PDPService.getInstance();
    //
    const permissions = mergeConditions([
      ...set.reference.permissions,
      ...set.external.permissions,
    ]);
    //
    const prohibitions = mergeConditions([
      ...set.reference.prohibitions,
      ...set.external.prohibitions,
    ]);
    //
    pdp.pushReferencePolicies(permissions, { build: false });
    pdp.pushReferencePolicies(prohibitions, { build: true, deny: true });

    // Todo remove double
    const policies: IAuthorisationPolicy[] = [
      ...this.genConditions(permissions),
      // ...this.genConditions(prohibitions),
    ];

    const validation = policies.every((policy) => {
      const isValid = pdp.evalPolicy(policy);
      console.log('isValid: ', isValid);
      return isValid;
    });

    return validation;
  }

  private genConditions(
    authorizations: IAuthorisationPolicy[],
  ): IAuthorisationPolicy[] {
    return authorizations.map((authorization: IAuthorisationPolicy) => {
      const auth = { ...authorization };
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

  public isAllowing(set: IPolicySet): boolean {
    const authorisationPolicySet: IAuthorisationPolicySet = {
      reference: {
        permissions: genPolicies(set.reference.permission),
        prohibitions: genPolicies(set.reference.prohibition),
      },
      external: {
        permissions: genPolicies(set.external.permission),
        prohibitions: genPolicies(set.external.prohibition),
      },
    };
    return this.evalAuthorisations(authorisationPolicySet);
  }
}
export default PDPService.getInstance();
