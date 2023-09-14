import {
  AbilityBuilder,
  PureAbility,
  AbilityClass,
  ConditionsMatcher,
  MatchConditions,
} from '@casl/ability';

export type PDPAction = /*'create' | 'read' | */ 'UPDATE' | 'DELETE';
type Ability = PureAbility<[PDPAction, string | Function]>;
const Ability = PureAbility as AbilityClass<Ability>;

export interface PDPPolicy {
  subjectType: string;
  action: PDPAction;
  conditions?: {};
  fields?: [];
}
/*
const lambdaMatcher: ConditionsMatcher<MatchConditions> = (matchConditions) =>
  matchConditions;
*/
const defineAbility = (policies: PDPPolicy[]) => {
  //
  const item: PDPPolicy = {
    subjectType: 'contract',
    action: 'UPDATE',
    conditions: {
      message: 'hello',
    } /*
    fields: [],
    */,
  };
  const { can: allow, build } = new AbilityBuilder(Ability);
  // policy.permission.forEach((item: any) => {
  allow(item.action, item.subjectType, item.fields, item.conditions);
  // });
  return build(/*{ conditionsMatcher: lambdaMatcher }*/);
};

const evalPolicy = async (policy: PDPPolicy) => {
  const ability = defineAbility([policy]);
  const hasPermission = ability.can(policy.action, policy.subjectType);
  console.log(hasPermission);
  return true;
};

export default { evalPolicy };
