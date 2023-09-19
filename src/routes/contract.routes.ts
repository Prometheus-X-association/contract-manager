import express from 'express';
import {
  createContract,
  getContract,
  updateContract,
  deleteContract,
  signContractForOrchestrator,
  signContractForParticipant,
  checkDataExploitation,
} from '../controllers/contract.controller';

const router = express.Router();

// Create
router.post('/', createContract);
// Read
router.get('/:id', getContract);
// Update
router.put('/:id', updateContract);
// Delete
router.delete('/:id', deleteContract);
//
// Sign contract for orchestrator
router.put('/:id', signContractForOrchestrator);
// Sign contract for participant
router.put('/:id', signContractForParticipant);
// Check data exploitation
router.put('/:id', checkDataExploitation);

export default router;
