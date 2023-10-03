import mongoose from 'mongoose';
import { seedPolicyReferenceRegistry } from './policy.reference.registry.seed';
import { config } from 'config/config';

async function connectAndSeed(url: string) {
  try {
    await mongoose.connect(url, { retryWrites: true });
    await seedPolicyReferenceRegistry();
    console.log(`Seed completed successfully for ${url}.`);
  } catch (error: any) {
    console.error(`Seed error for ${url}: ${error.message}`);
  } finally {
    mongoose.disconnect();
  }
}

async function run() {
  try {
    await connectAndSeed(config.mongo.testUrl);
    await connectAndSeed(config.mongo.url);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

run();
