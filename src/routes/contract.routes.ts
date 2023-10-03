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

/**
 * @swagger
 * tags:
 *   name: Contracts
 *   description: Endpoints for managing contracts
 * /contracts:
 *   post:
 *     summary: Create a contract
 *     description: |
 *       Creates a contract and returns it in ODRL format. You can provide input data, and if it is outside the contract model definitions, an error is returned indicating the problematic field.
 *     requestBody:
 *       description: Contract data input
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: ''
 *     responses:
 *       200:
 *         description: Success - Contract created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: ''
 *       400:
 *         description: Bad Request - Invalid input data, details in the response body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: ''
 *       500:
 *         description: Internal Server Error
 */
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
