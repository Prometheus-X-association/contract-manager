import DataRegistry from 'models/data.registry.model';

export async function seedPolicyReferenceRegistry() {
  try {
    await DataRegistry.deleteMany({});
    const seedDocument = new DataRegistry({
      contracts: {
        bilateral: bilateralModelSeedling,
        ecosystem: ecoSystemModelSeedling,
      },
    });
    await seedDocument.save();
  } catch (error: any) {
    throw new Error(`Seed error for data: ${error.message}`);
  }
}
