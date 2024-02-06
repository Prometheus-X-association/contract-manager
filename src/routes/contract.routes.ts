import express, { Router } from 'express';
import {
  createContract,
  getContract,
  updateContract,
  signContract,
  getContracts,
  getContractsFor,
  revokeContractSignature,
  injectPolicy,
  injectPolicies,
  injectPoliciesForRole,
  injectPoliciesForRoles,
  injectOfferingPolicies,
  checkExploitationByRole,
  getPolicyForServiceOffering,
  removeOfferingPolicies,
} from '../controllers/contract.controller';

// Ecosystem Contract Routes
const router: Router = express.Router();
router.get('/contracts/all/', getContracts);
router.get('/contracts/for/:did', getContractsFor);
router.post('/contracts/', createContract);
router.get('/contracts/:id', getContract);
router.get('/contracts/serviceoffering/:id', getPolicyForServiceOffering);
router.put('/contracts/:id', updateContract);
router.put('/contracts/sign/:id', signContract);
router.delete('/contracts/sign/revoke/:id/:did', revokeContractSignature);
router.post(
  '/contracts/role/exploitability/:id/:role',
  checkExploitationByRole,
);
router.put('/contracts/policy/:id', injectPolicy);
router.put('/contracts/policies/:id', injectPolicies);
router.put('/contracts/policies/role/:id', injectPoliciesForRole);
router.put('/contracts/policies/roles/:id', injectPoliciesForRoles);
router.put('/contracts/policies/offering/:id', injectOfferingPolicies);
router.delete(
  '/contracts/policies/offering/:id/:offering',
  removeOfferingPolicies,
);
export default router;
