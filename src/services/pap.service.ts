// Policy Administration Point
import Policy from 'models/policy.model';
import policyService from './policy.provider.service';
import { IPolicy } from 'interfaces/policy.interface';
import { IJSON } from 'interfaces/global.interface';

// Policy Administration Point
class PAPService {
  private static instance: PAPService;

  private constructor() {
    // Initialize the singleton, if needed
  }

  public static getInstance(): PAPService {
    if (!PAPService.instance) {
      PAPService.instance = new PAPService();
    }
    return PAPService.instance;
  }

  public async create(data: IJSON): Promise<IPolicy> {
    // Create a new policy
    const newPolicy = new Policy(data);
    const savedPolicy = await newPolicy.save();
    policyService.add(savedPolicy);
    return savedPolicy;
  }

  public async update(id: string, data: IJSON): Promise<IPolicy> {
    // Update an existing policy
    const updatedPolicy = await Policy.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedPolicy) {
      throw new Error('An error occurred while updating policy');
    }
    policyService.update(id, updatedPolicy);
    return updatedPolicy;
  }

  public async remove(id: string): Promise<IPolicy> {
    // Remove a policy by ID
    const deletedPolicy = await Policy.findByIdAndDelete(id);
    if (!deletedPolicy) {
      throw new Error('An error occurred while deleting policy');
    }
    policyService.remove(id);
    return deletedPolicy;
  }
}

export default PAPService.getInstance();
