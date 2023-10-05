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
router.post('/pap/policies', createPolicy);
// List all policies
router.get('/pap/policies', listPolicies);
// Get a policy by ID
router.get('/pap/policies/:id', getPolicy);
// Update a policy by ID
router.put('/pap/policies/:id', updatePolicy);
// Delete a policy by ID
router.delete('/pap/policies/:id', deletePolicy);

export default router;
