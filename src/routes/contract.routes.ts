import express, { Router, Request, Response, NextFunction } from 'express';
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
import { check, validationResult } from 'express-validator';
import { logPayloadMiddleware } from 'middlewares/logPayload.middleware';

/** UUID v4 validator reused on POST and PUT routes that accept a vlaId. */
const vlaIdRule = check('vlaId')
  .optional({ nullable: true, checkFalsy: true })
  .isUUID(4)
  .withMessage('vlaId must be a valid UUID v4');

/**
 * Middleware that returns 422 Unprocessable Entity when express-validator
 * finds errors. Must be placed after the check() calls on a route.
 */
const rejectOnValidationError = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
  next();
};

// Ecosystem Contract Routes
const router: Router = express.Router();
router.get('/contracts/all/', getContracts);
router.get('/contracts/for/:did', getContractsFor);
router.post('/contracts/', vlaIdRule, rejectOnValidationError, createContract);
router.get('/contracts/:id', getContract);
router.get('/contracts/serviceoffering/:id', getPolicyForServiceOffering);
router.put('/contracts/:id', vlaIdRule, rejectOnValidationError, updateContract);
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

// List the data processings within the chain available on the contrat
router.get('/contracts/:id/processings', getDataProcessings);
// Add the data processing chain to the contract
router.post('/contracts/:id/processings', writeDataProcessings);
// Insert a new data processing inside the chain at a specific given index
router.put('/contracts/:id/processings/insert', insertDataProcessing);
// Update a specific data processing from the chain
router.put('/contracts/:id/processings/update/:processingId', updateDataProcessing);
// Remove a specific data processing from the chain by index
router.delete('/contracts/:id/processings/:processingId', removeDataProcessing);

export default router;
