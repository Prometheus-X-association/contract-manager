import mongoose, { Schema } from 'mongoose';
import { DataRegistry } from '../interfaces/schemas.interface';

// Mongoose schema for contracts within the data registry
const ContractSchema: Schema = new Schema(
  {
    bilateral: { type: String, default: '{}' },
    ecosystem: { type: String, default: '{}' },
  },
  { _id: false },
);
const PolicySchema: Schema = new Schema(
  {
    odrlValidationSchema: { type: String, default: '{}' },
  },
  { _id: false },
);
// Mongoose schema for the data registry
const DataRegistrySchema: Schema = new Schema({
  contracts: { type: ContractSchema, default: {} },
  policies: { type: PolicySchema, default: {} },
});
// Mongoose model for DataRegistry
export default mongoose.model<DataRegistry>('DataRegistry', DataRegistrySchema);
