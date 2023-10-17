import PolicyReferenceRegistry from 'models/policy.registry.model';
import { IAuthorisationPolicy } from 'interfaces/policy.interface';

const policySeedling: IAuthorisationPolicy[] = [
  // PAP default authorisation rules
  {
    subject: '/pap',
    action: 'POST',
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
    conditions: {
      participant: 'admin',
    },
  },
  {
    subject: '/bilaterals',
    action: 'PUT',
    conditions: {
      participant: 'admin',
    },
  },
  {
    subject: '/bilaterals',
    action: 'DELETE',
    conditions: {
      participant: 'admin',
    },
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
    conditions: {
      participant: 'admin',
    },
  },
  {
    subject: '/contracts',
    action: 'PUT',
    conditions: {
      participant: 'admin',
    },
  },
  {
    subject: '/contracts',
    action: 'DELETE',
    conditions: {
      participant: 'admin',
    },
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
