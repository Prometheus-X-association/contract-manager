import DataRegistry from 'models/data.registry.model';

// Temporary bilateral contract model created for the development process
// This model serves as a placeholder until the final contract structure is defined
const bilateralModelSeedling: any = {
  '@context': 'http://www.w3.org/ns/odrl.jsonld',
  '@type': 'Agreement',
  '@id': 'DID:123',
  uri: 'http://example.com/contract/123',
  uid: '123',
  profile: 'http://example.com/profiles/data-exchange',
  permission: [
    {
      '@type': 'Offer',
      target: '',
      assigner: '',
      assignee: '',
      action: '',
      data: '',
      constraint: '',
    },
  ],
  data: [
    {
      '@type': 'Data',
      uid: '',
      type: '',
      purpose: '',
    },
  ],
  purpose: [
    {
      '@type': 'Purpose',
      uid: '',
      purpose: '',
      action: '',
      assigner: '',
      assignee: '',
      purposeCategory: '',
      consentType: '',
      piiCategory: '',
      primaryPurpose: '',
      termination: '',
      thirdPartyDisclosure: '',
      thirdPartyName: '',
    },
  ],
  signatures: [
    {
      '@type': 'Signature',
      party: 'Participant A VC token or whatever',
      value: 'Participant A, digital signature',
    },
    {
      '@type': 'Signature',
      party: 'Participant B VC token or whatever',
      value: 'Participant B, digital signature',
    },
  ],
  spiCat: '',
};
// Temporary ecoSystem contract model created for the development process
// This model serves as a placeholder until the final contract structure is defined
const ecoSystemModelSeedling: any = {
  '@context': 'http://www.w3.org/ns/odrl.jsonld',
  '@type': 'Agreement',
  '@id': 'DID:123',
  uri: 'http://example.com/contract/123',
  uid: '123',
  profile: 'http://example.com/profiles/data-exchange',
  permission: [
    {
      '@type': 'Offer',
      target: '',
      assigner: '',
      assignee: '',
      action: '',
      data: '',
      constraint: '',
    },
  ],
  data: [
    {
      '@type': 'Data',
      uid: '',
      type: '',
      purpose: '',
    },
  ],
  purpose: [
    {
      '@type': 'Purpose',
      uid: '',
      purpose: '',
      action: '',
      assigner: '',
      assignee: '',
      purposeCategory: '',
      consentType: '',
      piiCategory: '',
      primaryPurpose: '',
      termination: '',
      thirdPartyDisclosure: '',
      thirdPartyName: '',
    },
  ],
  signatures: [
    {
      '@type': 'Signature',
      party: 'Participant A VC token or whatever',
      value: 'Participant A, digital signature',
    },
    {
      '@type': 'Signature',
      party: 'Participant B VC token or whatever',
      value: 'Participant B, digital signature',
    },
  ],
  spiCat: '',
};
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
