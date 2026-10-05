// Ecosystem Contract Routes Test Cases
import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import { ContractMember } from 'interfaces/schemas.interface';
import { ContractService } from 'services/contract.service';
import Contract from 'models/contract.model';
import { config } from 'config/config';

let authTokenCookie: any;
const SERVER_PORT = 9999;
const API_ROUTE_BASE = '/contracts/';
describe('CRUD test cases for Contracts (Dataspace use cases).', () => {
  let server: any;
  before(async () => {
    server = await app.startServer(config.mongo.testUrl);
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        console.log(`Test server is running on port ${SERVER_PORT}`);
        resolve(true);
      });
    });
    Contract.deleteMany({});

    const authResponse = await supertest(app.router).get('/ping');
    authTokenCookie = authResponse.headers['set-cookie'];
  });

  after(async () => {
    const contractService = await ContractService.getInstance();
    try {
      await contractService.deleteContract(createdContractId);
    } catch (error: any) {
      console.log(error);
    }
    server.close();
    console.log('Test server stopped.');
  });

  // Variable to store the ID of the created contract
  let createdContractId: string;
  // Test case: Create a new contract
  it('should create a new contract', async () => {
    const contract = {
      '@context': 'http://www.w3.org/ns/odrl/2/',
      '@type': 'Offer',
      permission: [
        {
          action: 'read',
          target: 'http://contract-target/policy',
        },
        {
          action: 'use',
          target: 'http://contract-target/service',
        },
      ],
      useDVCT: true,
    };
    // Send a POST request to create the contract
    const response = await supertest(app.router)
      .post(`${API_ROUTE_BASE}`)
      .set('Cookie', authTokenCookie)
      .send({ contract, role: 'ecosystem' });
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('_id');
    // Store the contract ID for later use (for update and delete tests)
    createdContractId = response.body._id;
  });

  // Test case: Get a contract by ID
  it('should get a contract by ID', async () => {
    // Send a GET request to retrieve the contract by its ID
    const response = await supertest(app.router)
      .get(`${API_ROUTE_BASE}${createdContractId}`)
      .set('Cookie', authTokenCookie);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('_id');
  });

  // Test case: Update a contract by ID (basic fields)
  it('should update a contract by ID', async () => {
    const updatedContractData = {
      updated: true,
      useDVCT: false,
    };
    const response = await supertest(app.router)
      .put(`${API_ROUTE_BASE}${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(updatedContractData);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('_id');
  });

  // Test case: Update contract with the new `project` field
  it('should update a contract with project information', async () => {
    const updatedData = {
      project: {
        title: 'Test Project',
        caption: 'A test project caption',
        description: 'Description of the test project',
        categories: ['healthtech', 'dataspace'],
        countryOrRegion: 'FR',
        purpose: 'Research',
        benefit: 'Improve data sharing',
        legalBasisOfProcessing: 'Legitimate interest',
        legalBasisDescription: 'Used for research purposes',
        dataNeed: [{ resource: 'patient-data', description: 'Anonymised patient records' }],
        serviceNeed: [{ service: 'analytics-api', description: 'Data analytics service' }],
        contributions: [{ contribution: 'Data provision', description: 'Provide raw data' }],
        participantsAndRoles: [{ participant: 'did:partyA', roles: ['dataProvider'] }],
      },
    };
    const response = await supertest(app.router)
      .put(`${API_ROUTE_BASE}${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(updatedData);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('project');
    expect(response.body.project).to.have.property('title', 'Test Project');
    expect(response.body.project.categories).to.include('healthtech');
    expect(response.body.project.dataNeed).to.be.an('array').with.lengthOf(1);
    expect(response.body.project.participantsAndRoles[0]).to.have.property('participant', 'did:partyA');
  });

  // Test case: Update contract with the new `additionalClauses` field
  it('should update a contract with additionalClauses', async () => {
    const updatedData = {
      additionalClauses: {
        reversibilityExit: { value: 'Return + deletion', deadlineDays: 30 },
        subcontracting: { subcontractors: ['did:subcontractorA'] },
        securityIncidentNotification: { value: '72h' },
        intellectualPropertyOnOutputs: { value: 'Joint ownership' },
        governingLawAndJurisdiction: { countryISO: 'FR', disputeMode: 'Arbitration' },
        forceMajeure: { value: 'Standard + epidemic' },
        auditRight: { value: 'Audit on notice', frequency: 'Annual' },
        confidentiality: { value: 'Mutual NDA', survivalYears: 3 },
        amendmentModification: { value: 'Written amendment only' },
      },
    };
    const response = await supertest(app.router)
      .put(`${API_ROUTE_BASE}${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(updatedData);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('additionalClauses');
    const ac = response.body.additionalClauses;
    expect(ac.reversibilityExit).to.have.property('value', 'Return + deletion');
    expect(ac.securityIncidentNotification).to.have.property('value', '72h');
    expect(ac.governingLawAndJurisdiction).to.have.property('countryISO', 'FR');
    expect(ac.confidentiality).to.have.property('survivalYears', 3);
    expect(ac.subcontracting.subcontractors).to.include('did:subcontractorA');
  });

  // Test case: Update contract with top-level `customFields`
  it('should update a contract with top-level customFields', async () => {
    const updatedData = {
      customFields: {
        sector: 'healthcare',
        regulatoryFramework: 'HIPAA',
        internalRef: 'CTR-2026-001',
      },
    };
    const response = await supertest(app.router)
      .put(`${API_ROUTE_BASE}${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(updatedData);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('customFields');
    expect(response.body.customFields).to.have.property('sector', 'healthcare');
    expect(response.body.customFields).to.have.property('internalRef', 'CTR-2026-001');
  });

  // Test case: Update contract serviceOffering with new SLA, commitments, contractDuration and termination fields
  it('should update a contract serviceOffering with sla, commitments, contractDuration, termination and offering customFields', async () => {
    const offering = {
      participant: 'did:partyA',
      serviceOffering: 'https://catalog.example/offering/123',
      offerName: 'Premium Data Feed',
      offerId: 'offer-123',
      resources: [
        {
          resourceName: 'Patient Records',
          resourceId: 'res-001',
          resourceDescription: 'Anonymised patient data',
          piiInformation: {
            dataUserRole: 'dataProcessor',
            processingPurposes: ['Research'],
            legalBasis: 'Legitimate interest',
            usageRestrictions: ['No reidentification'],
            dpoContact: { name: 'Alice', email: 'alice@example.com', phone: '+33600000000' },
            plannedProcessingActivities: ['Analysis'],
            dataCategories: ['Health data'],
            dataSubjectCategories: ['Patients'],
            dataVolumeRange: '1000-10000',
            subProcessorsInvolved: [],
            transferOutsideEEA: { hasTransfer: false, countries: [], activities: [], safeguards: [] },
            subsequentSubProcessingNoticePeriod: 30,
            dataSubjectRightsAssistanceDelay: 5,
            securityBreachAssistanceDelay: '72h',
            auditNoticePeriod: 14,
            subsequentControllerReuseAuthorization: { authorized: false, details: 'Not allowed' },
            securityMeasures: { encryption: true, pseudonymisation: true },
            securityCertificationStandard: ['ISO27001'],
          },
        },
      ],
      pricing: { value: 500, billingPeriod: 'monthly', setupFee: 100, description: 'Standard plan' },
      sla: {
        availability: '99.9%',
        updateFrequency: 'Daily',
        responseTime: { value: 200, unit: 'ms', measurementBasis: 'p95' },
        availabilityTimeWindow: { value: '24/7', timezone: 'UTC' },
        retentionPeriod: 365,
        availabilityPeriod: '1 year',
        supportChannels: ['Email', 'Ticketing portal'],
        supportServiceHours: 'Business hours 5x8',
        supportSeverityLevel: [{ level: 'High', responseTimeValue: 4, responseTimeUnit: 'hours' }],
        measurementMonitoringMethod: 'Automated monitoring',
        note: 'SLA reviewed annually',
      },
      commitments: [
        {
          commitmentConcerned: 'availability',
          triggerOperator: '<',
          triggerValue: '99%',
          consequenceType: 'Service credit',
          penaltyAmount: 10,
          penaltyBasis: '% of period fee',
          penaltyCap: '% of monthly fee',
          measurementPeriod: 'Monthly',
          claimProcedure: 'Automatic credit',
          claimDeadlineDays: 30,
          note: 'Applied automatically',
        },
      ],
      contractDuration: { value: 12, unit: 'months', renewalMode: 'Automatic renewal', noticePeriodDays: 30 },
      terminationForConvenience: { allowed: true, noticePeriodDays: 60 },
      terminationForCause: {
        breachThreshold: 3,
        noticePeriod: 'X days notice',
        noticePeriodDays: 15,
        regulatoryOrSecurityTermination: 'Yes (immediate)',
        regulatoryNoticeDays: 0,
      },
      penaltiesTerminationLink: {
        cumulativePenaltyCapTermination: true,
        suspensionBeforeTermination: true,
        suspensionDurationDays: 7,
      },
      customFields: { dataFormat: 'JSON', transferProtocol: 'HTTPS' },
    };

    const response = await supertest(app.router)
      .put(`${API_ROUTE_BASE}${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send({ serviceOfferings: [offering] });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('serviceOfferings');
    const so = response.body.serviceOfferings[0];
    expect(so).to.have.property('offerName', 'Premium Data Feed');
    // Resources & PII
    expect(so.resources).to.be.an('array').with.lengthOf(1);
    expect(so.resources[0].piiInformation).to.have.property('dataUserRole', 'dataProcessor');
    expect(so.resources[0].piiInformation.securityCertificationStandard).to.include('ISO27001');
    // SLA
    expect(so.sla).to.have.property('availability', '99.9%');
    expect(so.sla.responseTime).to.have.property('unit', 'ms');
    expect(so.sla.supportChannels).to.include('Email');
    // Commitments
    expect(so.commitments).to.be.an('array').with.lengthOf(1);
    expect(so.commitments[0]).to.have.property('consequenceType', 'Service credit');
    expect(so.commitments[0]).to.have.property('claimProcedure', 'Automatic credit');
    // Contract Duration
    expect(so.contractDuration).to.have.property('value', 12);
    expect(so.contractDuration).to.have.property('renewalMode', 'Automatic renewal');
    // Termination
    expect(so.terminationForConvenience).to.have.property('allowed', true);
    expect(so.terminationForCause).to.have.property('breachThreshold', 3);
    expect(so.penaltiesTerminationLink).to.have.property('suspensionBeforeTermination', true);
    // Custom fields
    expect(so.customFields).to.have.property('dataFormat', 'JSON');
  });

  // Test case: Sign a contract for party A twice, party B once, the orchestrator, and set signed to true
  it('should sign a contract for party A twice, party B once, the orchestrator, and set signed to true', async () => {
    // Define the DID for each party
    const didPartyA: string = 'did:partyA';
    const didPartyB: string = 'did:partyB';
    const didOrchestrator: string = 'did:orchestrator';

    // Define the signature data for the orchestrator
    const signatureDataOrchestrator: ContractMember = {
      participant: didOrchestrator,
      role: 'orchestrator',
      signature: 'orchestratorSignature',
    };

    // Send a PUT request to sign the contract for the orchestrator
    const responseOrchestrator = await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(signatureDataOrchestrator);
    expect(responseOrchestrator.status).to.equal(200);

    // Define the signature data for party A for the first time
    const signatureDataPartyA1: ContractMember = {
      participant: didPartyA,
      role: 'partyA',
      signature: 'partyASignature1',
    };

    // Send a PUT request to sign the contract for party A the first time
    const responsePartyA1 = await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(signatureDataPartyA1);
    expect(responsePartyA1.status).to.equal(200);

    // Define the signature data for party A for the second time
    const signatureDataPartyA2: ContractMember = {
      participant: didPartyA,
      role: 'partyA',
      signature: 'partyASignature2',
    };

    // Send a PUT request to sign the contract for party A the second time
    const responsePartyA2 = await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(signatureDataPartyA2);
    // Define the signature data for party B
    const signatureDataPartyB: ContractMember = {
      participant: didPartyB,
      role: 'partyB',
      signature: 'partyBSignature',
    };

    // Send a PUT request to sign the contract for party B
    const responsePartyB = await supertest(app.router)
      .put(`${API_ROUTE_BASE}sign/${createdContractId}`)
      .set('Cookie', authTokenCookie)
      .send(signatureDataPartyB);
    expect(responsePartyB.status).to.equal(200);

    // Check if the response contains the updated contract with the signatures
    expect(responsePartyB.body).to.have.property('members');
    const members = responsePartyB.body.members;

    // Check if party A's second signature exists in the updated contract
    const partyASignature2 = members.find(
      (member: ContractMember) =>
        member.role === 'partyA' && member.signature === 'partyASignature2',
    );

    // Check if party B's signature exists in the updated contract
    const partyBSignature = members.find(
      (member: ContractMember) =>
        member.role === 'partyB' && member.signature === 'partyBSignature',
    );

    // Check if the orchestrator's signature exists in the updated contract
    const orchestratorSignature = members.find(
      (member: ContractMember) =>
        member.role === 'orchestrator' &&
        member.signature === 'orchestratorSignature',
    );

    // Check if both party A's second signature, party B's signature,
    // and orchestrator's signature do exist
    expect(partyASignature2).to.exist;
    expect(partyBSignature).to.exist;
    expect(orchestratorSignature).to.exist;

    // Check if the 'status' field is set to 'signed'
    expect(responsePartyB.body.status).to.equal('signed');
  });

  // Test case: Revoke a signature
  it('should revoke a signature and move it to revokedMembers', async () => {
    // Define the DID for party B
    const didPartyB: string = 'did:partyB';
    // Revoke the signature for party B
    const response = await supertest(app.router)
      .delete(`${API_ROUTE_BASE}sign/revoke/${createdContractId}/${didPartyB}`)
      .set('Cookie', authTokenCookie);
    //
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('revokedMembers');
    const revokedMembers = response.body.revokedMembers;
    // Check if the revoked signature exists in the revokedSignatures array
    const partyBRevokedSignature = revokedMembers.find(
      (member: ContractMember) =>
        member.role === 'partyB' &&
        member.signature === 'partyBSignature' &&
        member.participant === didPartyB,
    );
    // Check if the revoked signature exists in revokedMembers
    expect(partyBRevokedSignature).to.exist;
    // Check if the revoked signature does NOT exist in signatures
    const partyBSignatureInSignatures = response.body.members.find(
      (member: ContractMember) =>
        member.role === 'partyB' &&
        member.signature === 'partyBSignature' &&
        member.participant === didPartyB,
    );
    expect(partyBSignatureInSignatures).to.not.exist;
    expect(response.body.status).to.equal('revoked');
  });
});
