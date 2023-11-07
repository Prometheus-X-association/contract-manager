// Ecosystem Contract Routes
import express, { Router } from 'express';
import {
  createContract,
  getContract,
  getODRLContract,
  updateContract,
  signContract,
  checkDataExploitation,
  getContracts,
  getContractsFor,
  // getContractsByStatus,
  revokeContractSignature,
  injectPolicy,
} from '../controllers/contract.controller';

const router: Router = express.Router();

// Get all contracts with optional filter status
router.get('/contracts/all/', getContracts);
// Get contracts for a specific DID with an optional filter
router.get('/contracts/for/:did', getContractsFor);
// Create
router.post('/contracts/', createContract);
// Read
router.get('/contracts/:id', getContract);
//
router.get('/contracts/odrl/:id', getODRLContract);
// Update
router.put('/contracts/:id', updateContract);
// Sign contract
router.put('/contracts/sign/:id', signContract);
// Revoque signature
router.delete('/contracts/sign/revoke/:id/:did', revokeContractSignature);
// Check data exploitation
router.post('/contracts/check-exploitability/:id', checkDataExploitation);

router.post('/contracts/policy/:id', injectPolicy);

export default router;
