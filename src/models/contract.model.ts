import mongoose, { Schema, Document } from 'mongoose';
import { IContractDB } from './interfaces/contract.interface';
// Contract mongoose schema
const ContractSchema: Schema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  caller: {
    type: String,
    default: '',
  },
  generated: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model<IContractDB>('Contract', ContractSchema);
