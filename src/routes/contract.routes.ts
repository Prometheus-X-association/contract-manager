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
  writeDataProcessings,
  insertDataProcessing,
  removeDataProcessing,
  updateDataProcessing,
  deleteDataProcessing,
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

// List the data processings within the chain available on the contrat
router.get('/contracts/processings/:id', getDataProcessings);
// Add the data processing chain to the contract
router.post('/contracts/processings/:id', writeDataProcessings);
// Insert a new data processing inside the chain at a specific given index
router.put('/contracts/processings/insert/:id/:index', insertDataProcessing);
// Update a specific data processing from the chain
router.put('/contracts/processings/update/:id', updateDataProcessing);
// Remove a specific data processing from the chain
router.delete('/contracts/processings/:id', deleteDataProcessing);
// Remove a specific data processing from the chain by index
router.delete('/contracts/processings/:id/:index', removeDataProcessing);

export default router;
