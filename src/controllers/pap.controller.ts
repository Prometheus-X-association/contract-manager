import { Request, Response } from 'express';
import pap from 'services/policy/pap.service';
import Policy from 'models/policy.model';
import policyProviderService from 'services/policy/policy.provider.service';

/**
 * Validates an ODRL policy.
 *
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 */
export const verifyOdrlPolicy = async (req: Request, res: Response) => {
  // Extract the ODRL policy from the request body
  const odrlPolicy = req.body;
  try {
    // Verify the ODRL policy using the policyProviderService
    const isValid: boolean =
      await policyProviderService.verifyOdrlPolicy(odrlPolicy);
    // Respond with a success message if the policy is valid
    if (isValid) {
      return res.json({
        success: true,
        message: 'The ODRL policy has been successfully validated.',
      });
    } else {
      // Respond with an error message if the policy is not valid
      res.status(400).json({
        success: false,
        errors: 'The ODRL policy is not valid.',
      });
    }
  } catch (error: any) {
    // Respond with an error message if an exception occurs during validation
    res.status(400).json({ success: false, error: error.message });
  }
};

// Create a new policy
export const createPolicy = (req: Request, res: Response) => {
  try {
    // create policy using pap
    const policy = pap.create(req.body);
    res.status(201).json(policy);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
// Update a policy by ID
export const updatePolicy = (req: Request, res: Response) => {
  try {
    const policy = pap.update(req.params.id, req.body);
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
    const policy = pap.remove(req.params.id);
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
    const policies = await Policy.find(); //.select('-jsonLD -__v');
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
