import mongoose, { Schema, Document } from 'mongoose';

export interface IContract extends Document {
  createdAt: Date;
}

const ContractSchema: Schema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IContract>('Contract', ContractSchema);
