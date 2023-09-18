import mongoose, { Schema } from 'mongoose';
import { IContractDB } from '../interfaces/contract.interface';
// Contract mongoose schema
const ContractSchema: Schema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
    // Temporary field
    updated: {
      type: Boolean,
      default: false,
    },
  },
});
// Create a MongoDB model based on the schema
export default mongoose.model<IContractDB>('Contract', ContractSchema);
