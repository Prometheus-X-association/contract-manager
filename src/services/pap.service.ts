// Policy Administration Point
import Policy from 'models/policy.model';
import { Request } from 'express';
import policyService from './policy.provider.service';

// Create a new policy
const create = async (req: Request) => {
  const newPolicy = new Policy(req.body);
  const savedPolicy = await newPolicy.save();
  policyService.add(savedPolicy);
  return savedPolicy;
};
// Update an existing policy
const update = async (req: Request) => {
  const updatedPolicy = await Policy.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );
  if (updatedPolicy === null) {
    throw new Error('An error occured while updating policy');
  }
  policyService.update(req.params.id, updatedPolicy);
  return updatedPolicy;
};
// Remove a policy by ID
const remove = async (req: Request) => {
  const deletedPolicy = await Policy.findByIdAndDelete(req.params.id);
  if (deletedPolicy === null) {
    throw new Error('An error occured while updating policy');
  }
  policyService.remove(req.params.id);
  return deletedPolicy;
};

export default { create, update, remove };
