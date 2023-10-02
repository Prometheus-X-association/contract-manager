import express from 'express';
import {
  createContract,
  getContract,
  updateContract,
  deleteContract,
  signContract,
  checkDataExploitation,
  getAllContratFor,
} from '../controllers/bilateral.contract.controller';

const router = express.Router();

// Create
router.post('/contract/', createContract);
// Read
router.get('/contract/:id', getContract);
// Update
router.put('/contract/:id', updateContract);
// Delete
router.delete('/contract/:id', deleteContract);
//
// Sign contract
router.put('/contract/sign/:id', signContract);
// Check data exploitation
router.put('/contract/:id', checkDataExploitation);
// Get all contracts for a specific filter
//    /contract/all/?signed=true
//    /contract/all/?did=participantFakeTokenDID
//    /contract/all/?did=participantFakeTokenDID&hasSigned=true

router.get('/contract/all/', getAllContratFor);
export default router;
