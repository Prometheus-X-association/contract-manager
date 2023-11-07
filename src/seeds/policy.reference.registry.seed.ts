import PolicyReferenceRegistry from 'models/policy.registry.model';
import { IAuthorisationPolicy } from 'interfaces/policy.interface';

const policySeedling: IAuthorisationPolicy[] = [
  // User
  {
    subject: '/user',
    action: 'PUT',
    conditions: {},
  },
  // PAP default authorisation rules
  {
    subject: '/pap',
    action: 'POST',
    conditions: {},
  },
  {
    subject: '/pap',
    action: 'GET',
    conditions: {},
  },
  {
    subject: '/pap',
    action: 'PUT',
    conditions: {},
  },
  {
    subject: '/pap',
    action: 'DELETE',
    conditions: {},
  },
  // Bilateral contrat default authorisation rules
  {
    subject: '/bilaterals',
    action: 'GET',
    conditions: {},
  },
  {
    subject: '/bilaterals',
    action: 'POST',
    conditions: {},
  },
  {
    subject: '/bilaterals',
    action: 'PUT',
    conditions: {},
  },
  {
    subject: '/bilaterals',
    action: 'DELETE',
    conditions: {},
  },
  // Contract default authorisation rules
  {
    subject: '/contracts',
    action: 'GET',
    conditions: {},
  },
  {
    subject: '/contracts',
    action: 'POST',
    conditions: {},
  },
  {
    subject: '/contracts',
    action: 'PUT',
    conditions: {},
  },
  {
    subject: '/contracts',
    action: 'DELETE',
    conditions: {},
  },
];

export async function seedPolicyReferenceRegistry() {
  try {
    await PolicyReferenceRegistry.deleteMany({});
    const seedDocument = new PolicyReferenceRegistry({
      policies: policySeedling,
    });
    await seedDocument.save();
  } catch (error: any) {
    throw new Error(`Seed error for policies: ${error.message}`);
  }
}
