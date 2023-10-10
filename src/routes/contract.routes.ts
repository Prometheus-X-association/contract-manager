// Ecosystem Contract Routes
import express from 'express';
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
} from '../controllers/contract.controller';

const router = express.Router();

// Get all contracts
router.get('/contract/all/', getContracts);
// Get contracts for a specific DID with an optional filter
router.get('/contract/for/:did', getContractsFor);
// Get contracts for a specific status
// router.get('/contract/status/:status', getContractsByStatus);

// Create
router.post('/contract/', createContract);
// Read
router.get('/contract/:id', getContract);
router.get('/contract/odrl/:id', getODRLContract);
// Update
router.put('/contract/:id', updateContract);

// Sign contract
router.put('/contract/sign/:id', signContract);
// Revoque signature
router.delete('/contract/sign/revoke/:id/:did', revokeContractSignature);

// Check data exploitation
router.put('/contract/:id', checkDataExploitation);

export default router;
