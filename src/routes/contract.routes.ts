import express from 'express';
import {
  createContract,
  getContract,
  updateContract,
  deleteContract,
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

export default router;
