import { Request, Response } from 'express';
import pap from 'services/pap.service';
import Policy from 'models/policy.model';

// C.UD using PAP service
// Create a new policy
export const createPolicy = (req: Request, res: Response) => {
  try {
    // create policy using pap
    const policy = pap.create(req);
    res.status(201).json(policy);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
// Update a policy by ID
export const updatePolicy = (req: Request, res: Response) => {
  try {
    const policy = pap.update(req);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    res.json(policy);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
// Delete a policy by ID
export const deletePolicy = async (req: Request, res: Response) => {
  try {
    const policy = pap.remove(req);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    res.json(policy);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
// Read policies
// List all policies
export const listPolicies = async (req: Request, res: Response) => {
  try {
    const policies = await Policy.find();
    res.json(policies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
// Get a policy by ID
export const getPolicy = async (req: Request, res: Response) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    res.json(policy);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
