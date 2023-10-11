import DataRegistry from 'models/data.registry.model';

const bilateralModelSeedling: any = {};
const ecoSystemModelSeedling: any = {};

export async function seedDataRegistry() {
  try {
    await DataRegistry.deleteMany({});
    const seedDocument = new DataRegistry({
      contracts: {
        bilateral: JSON.stringify(bilateralModelSeedling),
        ecosystem: JSON.stringify(ecoSystemModelSeedling),
      },
    });
    await seedDocument.save();
  } catch (error: any) {
    throw new Error(`Seed error for data: ${error.message}`);
  }
}
