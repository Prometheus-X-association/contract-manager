// Policy Administration Point
import Policy from 'models/policy.model';
import { Request } from 'express';

// Create a new policy
const create = async (req: Request) => {
  const newPolicy = new Policy(req.body);
  const savedPolicy = await newPolicy.save();
  return savedPolicy;
};
// Update an existing policy
const update = async (req: Request) => {
  const updatedPolicy = await Policy.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );
  return updatedPolicy;
};
// Remove a policy by ID
const remove = async (req: Request) => {
  const deletedPolicy = await Policy.findByIdAndDelete(req.params.id);
  return deletedPolicy;
};

export default { create, update, remove };
