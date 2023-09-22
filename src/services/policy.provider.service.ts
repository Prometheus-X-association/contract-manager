import { AuthorizationPolicy } from './pdp.service';

// Policy Provider Service
class PolicyProviderService {
  private static instance: PolicyProviderService;
  private policies: AuthorizationPolicy[];

  private constructor() {
    // Initialize the singleton, if needed
    this.policies = [
      // Temporary default static policies for testing
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
      {
        subject: 'user',
        action: 'GET',
        conditions: {
          task: 'login',
        },
      },
    ];
  }

  public static getInstance(): PolicyProviderService {
    if (!PolicyProviderService.instance) {
      PolicyProviderService.instance = new PolicyProviderService();
    }
    return PolicyProviderService.instance;
  }

  // Add a new policy to the policy list
  public add(data: any): void {
    this.policies.push(data);
  }

  // Update an existing policy in the policy list by dbId
  public update(id: string, data: any): void {
    // Find the policy in the list based on its ID
    const index = this.policies.findIndex((policy: AuthorizationPolicy) => {
      return policy.dbId === id;
    });
    if (index !== -1) {
      // Update the policy in the list
      this.policies[index] = data;
    }
  }

  // Remove a policy from the policy list by dbId
  public remove(id: string): void {
    // Find the policy in the list based on its dbId
    const index = this.policies.findIndex((policy: AuthorizationPolicy) => {
      return policy.dbId === id;
    });
    if (index !== -1) {
      // Remove the policy from the list
      this.policies.splice(index, 1);
    }
  }

  // Fetch all policies from the policy list
  public fetch(): AuthorizationPolicy[] {
    return this.policies;
  }
}

export default PolicyProviderService.getInstance();
