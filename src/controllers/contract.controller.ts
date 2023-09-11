import { Request, Response } from 'express';
import Contract, { IContract } from '../models/contract';

// Create
export const createContract = async (req: Request, res: Response) => {
  try {
    const contractData: IContract = req.body;
    const newContract = new Contract(contractData);
    const savedContract = await newContract.save();
    res.status(201).json(savedContract);
  } catch (error) {
    res.status(500).json({
      error: 'An error occurred while creating the contract.',
    });
  }
};
// Read
export const getContract = async (req: Request, res: Response) => {
  try {
    const contractId: string = req.params.id;
    const contract: IContract | null = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }
    res.json(contract);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'An error occurred while retrieving the contract.' });
  }
};
// Update
export const updateContract = async (req: Request, res: Response) => {};
// Delete
export const deleteContract = async (req: Request, res: Response) => {};
