import mongoose from 'mongoose';
import { seedPolicyReferenceRegistry } from './policy.reference.registry.seed';
import { config } from 'config/config';

mongoose
  .connect(config.mongo.url, { retryWrites: true })
  .then(async () => {
    try {
      await seedPolicyReferenceRegistry();
      console.log('Seed completed successfully.');
    } catch (error: any) {
      console.error(`Seed error: ${error.message}`);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch((error) => {
    console.error(`MongoDB connection error: ${error.message}`);
  });
