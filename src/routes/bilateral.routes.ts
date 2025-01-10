import express, { Router } from 'express';
import {
  createContract,
  getContract,
  updateContract,
  signContract,
  checkDataExploitation,
  getContracts,
  getContractsFor,
  revokeContractSignature,
  addContractNegociator,
  injectPolicy,
  injectPolicies,
} from '../controllers/bilateral.controller';
import { logger } from '../utils/logger';
import { logPayloadMiddleware } from 'middlewares/logPayload.middleware';

const router: Router = express.Router();

router.get('/bilaterals/all/', getContracts);
router.get('/bilaterals/for/:did', getContractsFor);
router.post('/bilaterals/', createContract);
router.get('/bilaterals/:id', getContract);
router.put('/bilaterals/:id', updateContract);
router.put('/bilaterals/negociator/:id', addContractNegociator);
router.put('/bilaterals/sign/:id', signContract);
router.delete('/bilaterals/sign/revoke/:id/:did', revokeContractSignature);
router.post('/bilaterals/check-exploitability/:id', checkDataExploitation);
router.put('/bilaterals/policy/:id', injectPolicy);
router.put('/bilaterals/policies/:id', logPayloadMiddleware, injectPolicies);

export default router;
