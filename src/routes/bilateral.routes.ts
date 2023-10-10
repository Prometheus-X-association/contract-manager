import express from 'express';
import {
  createContract,
  getContract,
  updateContract,
  signContract,
  checkDataExploitation,
  getContracts,
  getContractsFor,
  // getContractsByStatus,
  revokeContractSignature,
  addContractNegociator,
} from '../controllers/bilateral.controller';

const router = express.Router();

// Get all contracts
router.get('/bilateral/contract/all/', getContracts);
// Get contracts for a specific DID with an optional filter
router.get('/bilateral/contract/for/:did', getContractsFor);
// Get contracts for a specific status
// router.get('/bilateral/contract/status/:status', getContractsByStatus);

// Create
router.post('/bilateral/contract/', createContract);
// Read
router.get('/bilateral/contract/:id', getContract);
// Update
router.put('/bilateral/contract/:id', updateContract);

// Add a negociator for a contract
router.put('/bilateral/contract/negociator/:id', addContractNegociator);
// Sign contract
router.put('/bilateral/contract/sign/:id', signContract);
// Revoke signature
router.delete(
  '/bilateral/contract/sign/revoke/:id/:did',
  revokeContractSignature,
);

// Check data exploitation
router.put('/bilateral/contract/:id', checkDataExploitation);

export default router;
