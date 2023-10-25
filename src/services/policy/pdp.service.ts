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
import { genConditions, genPolicies } from './utils';
import { logger } from 'utils/logger';

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

  /*
  public defineReferencePolicies(policies: IAuthorisationPolicy[]): void {
    // this.referencePolicies = policies;
    this.defineAbility(policies);
    this.authorisationAbility = this.buildAbility();
  }
  */

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

  private evalAuthorisations(set: IAuthorisationPolicySet): boolean {
    const refPermissions = set.reference.permissions;
    const extPermissions = set.external.permissions;
    const refProhibitions = set.reference.prohibitions;
    const extProhibitions = set.external.prohibitions;
    //
    this.pushReferencePolicies(refPermissions, { build: false });
    this.pushReferencePolicies(extPermissions, { build: false });
    this.pushReferencePolicies(refProhibitions, { build: false, deny: true });
    this.pushReferencePolicies(extProhibitions, { build: true, deny: true });

    const policies: IAuthorisationPolicy[] = [
      ...genConditions(extProhibitions),
      ...genConditions(extProhibitions),
    ];

    const validation = policies.every((policy) => {
      const isValid = this.evalPolicy(policy);
      console.log('isValid: ', isValid);
      return isValid;
    });

    return validation;
  }

  public isAuthorised(set: IPolicySet): boolean {
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
