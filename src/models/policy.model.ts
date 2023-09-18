import mongoose, { Schema } from 'mongoose';
import { IPolicy } from '../interfaces/policy.interface';

// Policy mongoose schema
const policySchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
});
// Create a MongoDB model based on the schema
export default mongoose.model<IPolicy>('Policy', policySchema);
