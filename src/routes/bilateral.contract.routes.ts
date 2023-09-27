import express from 'express';
import {
  createContract,
  getContract,
  updateContract,
  deleteContract,
  signContract,
  checkDataExploitation,
} from '../controllers/bilateral.contract.controller';

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
// Sign contract
router.put('/sign/:id', signContract);
// Check data exploitation
router.put('/:id', checkDataExploitation);

export default router;
