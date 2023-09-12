import { Request, Response } from 'express';
import Contract, {
  IContract,
  IContractDB,
  IContractHeader,
} from 'models/contract.model';
import { genContract } from 'services/contract.service';
// Create
export const createContract = async (req: Request, res: Response) => {
  console.log(req);
  try {
    const contractHeader: IContractHeader = {
      caller: req.body.caller,
    };
    const generatedContract: IContract = genContract(contractHeader);
    const newContract = new Contract(generatedContract);
    const savedContract = await newContract.save();
    return res.status(201).json(savedContract);
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
    const contract: IContractDB | null = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }
    return res.json(contract);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'An error occurred while retrieving the contract.' });
  }
};

// Update
export const updateContract = async (req: Request, res: Response) => {
  try {
    const contractId: string = req.params.id;
    const updates: Partial<IContractDB> = req.body;
    const updatedContract: IContractDB | null =
      await Contract.findByIdAndUpdate(contractId, updates, { new: true });
    if (!updatedContract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }
    return res.json(updatedContract);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'An error occurred while updating the contract.' });
  }
};
// Delete
export const deleteContract = async (req: Request, res: Response) => {
  try {
    const contractId: string = req.params.id;
    const deletedContract: IContractDB | null =
      await Contract.findByIdAndDelete(contractId);
    if (!deletedContract) {
      return res.status(404).json({ error: 'Contract not found.' });
    }
    return res.json({ message: 'Contract deleted successfully.' });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'An error occurred while deleting the contract.' });
  }
};
