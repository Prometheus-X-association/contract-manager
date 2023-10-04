// Ecosystem Contract Routes
import express from 'express';
import {
  createContract,
  getContract,
  updateContract,
  // deleteContract,
  signContract,
  checkDataExploitation,
  getAllContratFor,
  revokeContractSignature,
} from '../controllers/contract.controller';

const router = express.Router();

// Get all contracts for a specific filter
//    /all/?did=participantFakeTokenDID
//    /all/?did=participantFakeTokenDID&hasSigned=true
router.get('/all/', getAllContratFor);

// Create
router.post('/', createContract);
// Read
router.get('/:id', getContract);
// Update
router.put('/:id', updateContract);
// Delete
// .delete('/:id', deleteContract);
//
// Sign contract
router.put('/sign/:id', signContract);
// Revoque signature
router.delete('/sign/revoke/:id/:did', revokeContractSignature);
// Check data exploitation
router.put('/:id', checkDataExploitation);

export default router;
