import mongoose, { Schema, Document } from 'mongoose';
// Interface for header data of the contrat, Data given to the REST API.
export interface IContractHeader {
  caller: string;
}
// Interface for the generated contract
export interface IContract extends IContractHeader {
  generated?: boolean;
}
// Type used for Contract data manipulation within the API
export type IContractDB = IContract &
  Document & {
    createdAt: Date;
  };
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
