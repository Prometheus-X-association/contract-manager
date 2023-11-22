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
router.post('/pap/policies/', createPolicy);
router.get('/pap/policies/', listPolicies);
router.get('/pap/policies/:name', getPoliciesByName);
router.get('/pap/policies/:id', getPolicy);
router.put('/pap/policies/:id', updatePolicy);
router.post('/pap/policies/verify', verifyOdrlPolicy);
router.delete('/pap/policies/:id', deletePolicy);

export default router;
