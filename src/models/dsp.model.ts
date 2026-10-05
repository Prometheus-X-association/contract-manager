import { IDSPContractDB } from 'interfaces/contract.interface';
import mongoose, { Schema } from 'mongoose';

export const DSPSchema: Schema = new Schema({
  '@context': { type: [String], required: true },
  '@type': {
    type: String,
    required: true,
  },
  consumerPid: { type: String, required: false },
  providerPid: { type: String, required: false },
  state: {
    type: String,
    enum: [
      'REQUESTED',
      'OFFERED',
      'ACCEPTED',
      'AGREED',
      'VERIFIED',
      'FINALIZED',
      'TERMINATED',
    ],
    required: true,
  },
  offer: { type: Schema.Types.Mixed, required: false },
  agreement: { type: Schema.Types.Mixed, required: false },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  callbackAddress: { type: String, required: false },
});

export default mongoose.model<IDSPContractDB>('DSP', DSPSchema);
