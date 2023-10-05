import express from 'express';
import {
  createContract,
  getContract,
  updateContract,
  signContract,
  checkDataExploitation,
  getAllContracts,
  getContractsFor,
  // getContractsByStatus,
  revokeContractSignature,
  addContractNegociator,
} from '../controllers/bilateral.controller';

const router = express.Router();

// Get all contracts
router.get('/contract/all', getAllContracts);
// Get contracts for a specific DID with an optional filter
router.get('/contract/for/:did', getContractsFor);
// Get contracts for a specific status
// router.get('/contract/status/:status', getContractsByStatus);

// Create
router.post('/contract/', createContract);
// Read
router.get('/contract/:id', getContract);
// Update
router.put('/contract/:id', updateContract);

// Add a negociator for a contract
router.put('/contract/negociator/:id', addContractNegociator);
// Sign contract
router.put('/contract/sign/:id', signContract);
// Revoke signature
router.delete('/contract/sign/revoke/:id/:did', revokeContractSignature);

// Check data exploitation
router.put('/contract/:id', checkDataExploitation);

export default router;
