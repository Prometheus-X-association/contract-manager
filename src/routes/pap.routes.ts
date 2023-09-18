import express from 'express';
import {
  createPolicy,
  listPolicies,
  getPolicy,
  updatePolicy,
  deletePolicy,
} from 'controllers/pap.controller';
const router = express.Router();

// CRUD routes for policy managment
// Create a new policy
router.post('/policies', createPolicy);
// List all policies
router.get('/policies', listPolicies);
// Get a policy by ID
router.get('/policies/:id', getPolicy);
// Update a policy by ID
router.put('/policies/:id', updatePolicy);
// Delete a policy by ID
router.delete('/policies/:id', deletePolicy);

export default router;
