import { IPolicy } from 'interfaces/policy.interface';
import Policy from 'models/policy.model';

interface IPolicyJson extends Omit<IPolicy, '_id'> {
  jsonLD: any;
}

const policies: IPolicyJson[] = [
  {
    name: '...',
    description: '...',
    jsonLD: {},
  },
];

export async function seedPolicies() {
  const policiesData: Omit<IPolicy, '_id'>[] = policies.map((policy) => ({
    name: policy.name,
    description: policy.description,
    jsonLD: JSON.stringify(policy.jsonLD),
  }));

  try {
    await Policy.deleteMany({});
    await Policy.insertMany(policiesData);
  } catch (error: any) {
    throw new Error(`Seed error for data: ${error.message}`);
  }
}
