import mongoose, { Schema } from 'mongoose';
import { IRuleDB } from '../interfaces/policy.interface';

const RuleSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  requestedFields: [{ type: String, required: true }],
  policy: { type: mongoose.Schema.Types.Mixed, required: true },
});
RuleSchema.index({ description: 'text' });
export default mongoose.model<IRuleDB>('Rule', RuleSchema);
