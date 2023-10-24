import {
  AbilityBuilder,
  PureAbility,
  MatchConditions,
  SubjectType,
  mongoQueryMatcher,
  AbilityOptionsOf,
} from '@casl/ability';
import { PDPAction, IAuthorisationPolicy } from 'interfaces/policy.interface';
import { genInputPolicies, genPolicies } from './utils';
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

  public defineReferencePolicies(policies: IAuthorisationPolicy[]): void {
    // this.referencePolicies = policies;
    this.defineAbility(policies);
    this.authorisationAbility = this.buildAbility();
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
  private defineAbility(policies: IAuthorisationPolicy[]): void {
    const { can: allow, cannot: deny } = this.builder;
    // Define permissions based on policies
    policies.forEach((item: IAuthorisationPolicy) => {
      const matchConditions = mongoQueryMatcher(item.conditions);
      allow(
        item.action,
        item.subject,
        /* item.fields,*/
        matchConditions,
      );
    });
  }

  // Build current ability and make sure to generate the next builder
  public buildAbility(): Ability {
    // Build and return the ability using the lambda conditions matcher
    const ability = this.builder.build({
      conditionsMatcher: PDPService.lambdaMatcher,
    });
    // Generate a fresh new builder for the next use
    this.builder = this.getBuilder();
    return ability;
  }

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
    const validation = inputPolicies.every((policy) => {
      const isValid = this.evalPolicy(policy, constraint.cannot);
      console.log('isValid: ', isValid);
      return isValid;
    });
    return validation;
  }

  public isAuthorised(constraints: any[]): boolean {
    const isAuthorised = constraints.every((constraint) => {
      console.log(`\x1b[36m${JSON.stringify(constraint, null, 2)}\x1b[37m`);
      //
      return this.checkConstraint(constraint);
    });
    return isAuthorised;
  }
}

export default PDPService.getInstance();
