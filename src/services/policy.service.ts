// Policy Service
import { PDPPolicy } from './pdp.service';

// Temporary default static policies for testing
const policies: PDPPolicy[] = [
  {
    subject: 'contract',
    action: 'GET',
    conditions: {},
  },
  {
    subject: 'is-it-alive',
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
    action: 'DELETE',
    conditions: {
      participant: 'admin',
    },
  },
  {
    subject: 'user',
    action: 'GET',
    conditions: {
      task: 'login',
    },
  },
];
// Add a new policy to the policy list
const add = (data: any) => {
  policies.push(data);
};
// Update an existing policy in the policy list by dbId
const update = (id: string, data: any) => {
  // Find the policy in the list based on its ID
  const index = policies.findIndex((policy: PDPPolicy) => {
    return policy.dbId === id;
  });
  if (index !== -1) {
    // Update the policy in the list
    policies[index] = data;
  }
};
// Remove a policy from the policy list by dbId
const remove = (id: string) => {
  // Find the policy in the list based on its dbId
  const index = policies.findIndex((policy: PDPPolicy) => {
    return policy.dbId === id;
  });
  if (index !== -1) {
    // Remove the policy from the list
    policies.splice(index, 1);
  }
};
// Fetch all policies from the policy list
const fetch = (): PDPPolicy[] => {
  return policies;
};

export default { fetch, add, update, remove };
