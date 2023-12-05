import DataRegistry from 'models/data.registry.model';

// Temporary bilateral contract model created for the development process
// This model serves as a placeholder until the final contract structure is defined
const bilateralModelSeedling: any = {
  '@context': '',
  '@type': '',
  permission: [
    {
      '@type': '',
      target: '',
      action: '',
      constraint: [],
    },
  ],
  prohibition: [
    {
      '@type': '',
      target: '',
      action: '',
      constraint: [],
    },
  ],
};
// Temporary ecoSystem contract model created for the development process
// This model serves as a placeholder until the final contract structure is defined
const ecoSystemModelSeedling: any = {
  '@context': '',
  '@type': '',
  permission: [
    {
      '@type': '',
      target: '',
      action: '',
      constraint: [],
    },
  ],
  prohibition: [
    {
      '@type': '',
      target: '',
      action: '',
      constraint: [],
    },
  ],
};

export async function seedDataRegistry() {
  try {
    await DataRegistry.deleteMany({});
    const seedDocument = new DataRegistry({
      contracts: {
        bilateral: JSON.stringify(bilateralModelSeedling),
        ecosystem: JSON.stringify(ecoSystemModelSeedling),
      },
      policies: {},
    });
    await seedDocument.save();
  } catch (error: any) {
    throw new Error(`Seed error for data: ${error.message}`);
  }
}
