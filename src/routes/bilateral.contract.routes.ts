import express from 'express';
import {
  createContract,
  getContract,
  updateContract,
  deleteContract,
  signContract,
  checkDataExploitation,
  getAllContratFor,
  revokeContractSignature,
} from '../controllers/bilateral.contract.controller';

const router = express.Router();

// Get all contracts for a specific filter
//    /contract/all/?did=participantFakeTokenDID
//    /contract/all/?did=participantFakeTokenDID&hasSigned=false
router.get('/contract/all/', getAllContratFor);

// Create
router.post('/contract/', createContract);
// Read
router.get('/contract/:id', getContract);
// Update
router.put('/contract/:id', updateContract);
// Delete
// .delete('/contract/:id', deleteContract);
//
// Sign contract
router.put('/contract/sign/:id', signContract);
// Revoque signature
router.delete('/sign/revoke/:id/:did', revokeContractSignature);
// Check data exploitation
router.put('/contract/:id', checkDataExploitation);

export default router;
