import express from 'express';
import {
  createContract,
  getContract,
  updateContract,
  //  deleteContract,
  signContract,
  checkDataExploitation,
  getAllContratFor,
  revokeContractSignature,
  addContractNegociator,
} from '../controllers/bilateral.controller';

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
// Add negociator contract
router.put('/contract/negociator/:id', addContractNegociator);
// Sign contract
router.put('/contract/sign/:id', signContract);
// Revoque signature
router.delete('/contract/sign/revoke/:id/:did', revokeContractSignature);
// Check data exploitation
router.put('/contract/:id', checkDataExploitation);

export default router;
