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
  getServiceChains,
  writeServiceChains,
  insertServiceChain,
  removeServiceChain,
  updateServiceChain,
  deleteServiceChain,
} from '../controllers/contract.controller';
import { check } from 'express-validator';
import { logPayloadMiddleware } from 'middlewares/logPayload.middleware';

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
// Roles and Obligations
router.put('/contracts/policy/:id', injectPolicy);
router.put('/contracts/policies/:id', injectPolicies);
router.put('/contracts/policies/role/:id', injectPoliciesForRole);
router.put('/contracts/policies/roles/:id', injectPoliciesForRoles);
// Service Offerings
router.put(
  '/contracts/policies/offering/:id',
  logPayloadMiddleware,
  injectOfferingPolicies,
);
router.delete(
  '/contracts/policies/offering/:contractId/:offeringId/:participantId',
  [
    check('contractId').isString(),
    check('offeringId').isString(),
    check('participantId').isString(),
  ],
  removeOfferingPolicies,
);

// List the service chains within the chain available on the contrat
router.get('/contracts/:id/servicechains', getServiceChains);
// Add the service chain to the contract
router.post('/contracts/:id/servicechains', writeServiceChains);
// Insert a new service chain inside the chain at a specific given index
router.put('/contracts/:id/servicechains/insert', insertServiceChain);
// Update a specific service chain from the chain
router.put('/contracts/:id/servicechains/update/:chainId', updateServiceChain);
// Remove a specific service chain from the chain by index
router.delete('/contracts/:id/servicechains/:chainId', removeServiceChain);

export default router;
