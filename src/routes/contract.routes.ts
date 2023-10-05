// Ecosystem Contract Routes
import express from 'express';
import {
  createContract,
  getContract,
  updateContract,
  signContract,
  checkDataExploitation,
  getAllContracts,
  getContractsFor,
  getContractsByStatus,
  revokeContractSignature,
} from '../controllers/contract.controller';

const router = express.Router();

// Get all contracts
router.get('/all', getAllContracts);
// Get contracts for a specific DID with an optional filter
router.get('/for/:did', getContractsFor);
// Get contracts for a specific status
router.get('/status/:status', getContractsByStatus);

// Create
router.post('/', createContract);
// Read
router.get('/:id', getContract);
// Update
router.put('/:id', updateContract);

// Sign contract
router.put('/sign/:id', signContract);
// Revoque signature
router.delete('/sign/revoke/:id/:did', revokeContractSignature);

// Check data exploitation
router.put('/:id', checkDataExploitation);

export default router;
