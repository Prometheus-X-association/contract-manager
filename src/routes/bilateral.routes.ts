import express, { Router } from 'express';
import {
  createContract,
  getContract,
  updateContract,
  signContract,
  checkDataExploitation,
  getContracts,
  getContractsFor,
  // getContractsByStatus,
  revokeContractSignature,
  addContractNegociator,
  injectPolicy,
} from '../controllers/bilateral.controller';

const router: Router = express.Router();

// Get all contracts with optional filter status
router.get('/bilaterals/all/', getContracts);
// Get contracts for a specific DID with an optional filter
router.get('/bilaterals/for/:did', getContractsFor);
// Create
router.post('/bilaterals/', createContract);
// Read
router.get('/bilaterals/:id', getContract);
// Update
router.put('/bilaterals/:id', updateContract);
// Add a negociator for a contract
router.put('/bilaterals/negociator/:id', addContractNegociator);
// Sign contract
router.put('/bilaterals/sign/:id', signContract);
// Revoke signature
router.delete('/bilaterals/sign/revoke/:id/:did', revokeContractSignature);
// Check data exploitation
router.post('/bilaterals/check-exploitability/:id', checkDataExploitation);

router.post('/bilaterals/policy/:id', injectPolicy);

export default router;
