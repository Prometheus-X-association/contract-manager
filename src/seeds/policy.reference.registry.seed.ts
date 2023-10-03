import PolicyReferenceRegistry from 'models/policy.registry.model';
import { IAuthorisationPolicy } from 'interfaces/policy.interface';

const policySeedling: IAuthorisationPolicy[] = [
  // Temporary default static policies for testing
  {
    subject: 'is-it-alive',
    action: 'GET',
    conditions: {},
  },
  // Bilateral contrat default authorisation rules
  {
    subject: 'bilateral',
    action: 'GET',
    conditions: {},
  },
  {
    subject: 'bilateral',
    action: 'POST',
    conditions: {
      participant: 'admin',
    },
  },
  {
    subject: 'bilateral',
    action: 'PUT',
    conditions: {
      participant: 'admin',
    },
  },
  {
    subject: 'bilateral',
    action: 'DELETE',
    conditions: {
      participant: 'admin',
    },
  },
  // Contract default authorisation rules
  {
    subject: 'contract',
    action: 'GET',
    conditions: {},
  },
  {
    subject: 'contract',
    action: 'POST',
    conditions: {
      participant: 'admin',
    },
  },
  {
    subject: 'contract',
    action: 'PUT',
    conditions: {
      participant: 'admin',
    },
  },
  {
    subject: 'contract',
    action: 'DELETE',
    conditions: {
      participant: 'admin',
    },
  },
  // User default authorisation rules
  {
    subject: 'user',
    action: 'GET',
    conditions: {
      task: 'login',
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
