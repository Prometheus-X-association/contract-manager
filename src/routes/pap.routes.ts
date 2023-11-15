import express, { Router } from 'express';
import {
  createPolicy,
  listPolicies,
  getPolicy,
  updatePolicy,
  deletePolicy,
  verifyOdrlPolicy,
  getPoliciesByName,
} from 'controllers/pap.controller';
const router: Router = express.Router();

router.post('/pap/policies/verify', verifyOdrlPolicy);

// CRUD routes for policy managment
// Create a new policy
router.post('/pap/policies/', createPolicy);
// List all policies
router.get('/pap/policies/', listPolicies);
// get policy by name
router.get('/pap/policies/:name', getPoliciesByName);
// Get a policy by ID
router.get('/pap/policies/:id', getPolicy);
// Update a policy by ID
router.put('/pap/policies/:id', updatePolicy);
// Delete a policy by ID
router.delete('/pap/policies/:id', deletePolicy);

export default router;
