import mongoose, { Schema } from 'mongoose';
import { IContractDB } from '../interfaces/contract.interface';
// Contract mongoose schema
const ContractSchema: Schema = new Schema({
  permissions: {},
  // Temporary field
  createdAt: {
    type: Date,
    default: Date.now,
    updated: {
      type: Boolean,
      default: false,
    },
    signedByOrchestrator: {
      type: Boolean,
      default: false,
    },
    signedByParticipant: {
      type: Boolean,
      default: false,
    },
  },
});
// Create a MongoDB model based on the schema
export default mongoose.model<IContractDB>('Contract', ContractSchema);
