// Policy Administration Point
import Policy from 'models/rule.model';
import { IRule } from 'interfaces/policy.interface';
import { IJSON } from 'interfaces/global.interface';
// Policy Administration Point
class PAPService {
  private static instance: PAPService;
  private constructor() {}
  public static getInstance(): PAPService {
    if (!PAPService.instance) {
      PAPService.instance = new PAPService();
    }
    return PAPService.instance;
  }
  // Create a new policy
  public async create(data: IJSON): Promise<IRule> {
    const newPolicy = new Policy(data);
    const savedPolicy = await newPolicy.save();
    return savedPolicy;
  }
  // Update an existing policy
  public async update(id: string, data: IJSON): Promise<IRule> {
    const updatedPolicy = await Policy.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedPolicy) {
      throw new Error('An error occurred while updating policy');
    }
    return updatedPolicy;
  }
  // Remove a policy by ID
  public async remove(id: string): Promise<IRule> {
    const deletedPolicy = await Policy.findByIdAndDelete(id, {
      new: true,
    });
    if (!deletedPolicy) {
      throw new Error('An error occurred while deleting policy');
    }
    return deletedPolicy;
  }
}
export default PAPService.getInstance();
