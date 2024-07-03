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
  getDataProcessings,
  updateDataProcessings,
  insertDataProcessing,
  removeDataProcessing,
  updateDataProcessing,
} from '../controllers/contract.controller';
import { check } from 'express-validator';

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
  '/contracts/policies/offering/:contractId/:offeringId/:participantId',
  [
    check('contractId').isString(),
    check('offeringId').isString(),
    check('participantId').isString(),
  ],
  removeOfferingPolicies,
);

router.get('/contracts/processings/:id', getDataProcessings);
router.put('/contracts/processings/:id', updateDataProcessings);

router.put('/contracts/processings/insert/:id/:index', insertDataProcessing);
router.put('/contracts/processings/update/:id', updateDataProcessing);
router.delete('/contracts/processings/remove/:id', removeDataProcessing);

export default router;
