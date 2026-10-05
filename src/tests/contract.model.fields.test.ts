/**
 * Tests for the new fields introduced in the Contract model.
 * Covers: project, additionalClauses, serviceChains, customFields (contract & offering),
 * and offering-level fields: offerName/offerId/offerCaption, resources (+ piiInformation),
 * pricing, sla, commitments, contractDuration, terminationForConvenience,
 * terminationForCause, penaltiesTerminationLink.
 */
import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import Contract from 'models/contract.model';
import { ContractService } from 'services/contract.service';
import { config } from 'config/config';

const SERVER_PORT = 9998;
const API_ROUTE_BASE = '/contracts/';

describe('New fields of the Contract model', () => {
  let server: any;
  let authTokenCookie: any;
  let contractService: ContractService;
  const createdIds: string[] = [];

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const baseContract = () => ({
    '@context': 'http://www.w3.org/ns/odrl/2/',
    '@type': 'Offer',
    permission: [{ action: 'use', target: 'http://target/resource' }],
  });

  const baseOffering = () => ({
    participant: 'did:participant:A',
    serviceOffering: 'did:offering:X',
    policies: [],
  });

  async function createContract(extra: object = {}): Promise<any> {
    const response = await supertest(app.router)
      .post(API_ROUTE_BASE)
      .set('Cookie', authTokenCookie)
      .send({ contract: { ...baseContract(), ...extra }, role: 'ecosystem' });
    expect(response.status).to.equal(201);
    createdIds.push(response.body._id);
    return response.body;
  }

  async function updateContract(id: string, patch: object): Promise<any> {
    const response = await supertest(app.router)
      .put(`${API_ROUTE_BASE}${id}`)
      .set('Cookie', authTokenCookie)
      .send(patch);
    expect(response.status).to.equal(200);
    return response.body;
  }

  async function getContract(id: string): Promise<any> {
    const response = await supertest(app.router)
      .get(`${API_ROUTE_BASE}${id}`)
      .set('Cookie', authTokenCookie);
    expect(response.status).to.equal(200);
    return response.body;
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────
  before(async () => {
    server = await app.startServer(config.mongo.testUrl);
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => {
        console.log(`Test server running on port ${SERVER_PORT}`);
        resolve(true);
      });
    });
    await Contract.deleteMany({});

    const authResponse = await supertest(app.router).get('/ping');
    authTokenCookie = authResponse.headers['set-cookie'];

    contractService = await ContractService.getInstance();
  });

  after(async () => {
    for (const id of createdIds) {
      try {
        await contractService.deleteContract(id);
      } catch (_) {}
    }
    server.close();
    console.log('Test server stopped.');
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // SERVICE CHAINS
  // ══════════════════════════════════════════════════════════════════════════════
  describe('serviceChains', () => {
    it('should persist serviceChains on contract creation', async () => {
      const body = await createContract({
        serviceChains: [
          {
            catalogId: 'cat-1',
            serviceChainId: 'chain-1',
            services: [{ serviceId: 'svc-A' }, { serviceId: 'svc-B' }],
          },
        ],
      });
      const contract = await getContract(body._id);
      expect(contract.serviceChains).to.be.an('array').with.lengthOf(1);
      expect(contract.serviceChains[0]).to.include({ catalogId: 'cat-1', serviceChainId: 'chain-1' });
      expect(contract.serviceChains[0].services).to.have.lengthOf(2);
    });

    it('should default serviceChains to empty array when not provided', async () => {
      const body = await createContract();
      const contract = await getContract(body._id);
      expect(contract.serviceChains).to.be.an('array').that.is.empty;
    });
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // CONTRACT-LEVEL customFields
  // ══════════════════════════════════════════════════════════════════════════════
  describe('customFields (contract level)', () => {
    it('should persist arbitrary customFields', async () => {
      const body = await createContract({
        customFields: { sector: 'healthcare', contractVersion: 3 },
      });
      const contract = await getContract(body._id);
      expect(contract.customFields).to.deep.include({ sector: 'healthcare', contractVersion: 3 });
    });

    it('should default customFields to null when not provided', async () => {
      const body = await createContract();
      const contract = await getContract(body._id);
      expect(contract.customFields).to.be.null;
    });
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // PROJECT
  // ══════════════════════════════════════════════════════════════════════════════
  describe('project', () => {
    it('should persist full project block', async () => {
      const project = {
        title: 'My Project',
        caption: 'Caption',
        description: 'A test project',
        categories: ['health', 'data'],
        countryOrRegion: 'FR',
        picture: 'https://img.example.com/pic.png',
        purpose: 'Research',
        benefit: 'Improved outcomes',
        desiredDataAvailabilityDate: new Date('2026-01-01').toISOString(),
        legalBasisOfProcessing: 'Consent',
        legalBasisDescription: 'GDPR Art. 6(1)(a)',
        dataNeed: [{ resource: 'resource-A', description: 'Patient data' }],
        serviceNeed: [{ service: 'svc-B', description: 'Analytics' }],
        serviceInfrastructures: [{ infrastructure: 'infra-C', description: 'Cloud' }],
        criteriaAndConditions: 'Must comply with GDPR',
        contributions: [{ contribution: 'Dataset', description: 'Anonymized records' }],
        participantsAndRoles: [{ participant: 'did:org:1', roles: ['dataController'] }],
      };

      const body = await createContract({ project });
      const contract = await getContract(body._id);

      expect(contract.project).to.exist;
      expect(contract.project.title).to.equal('My Project');
      expect(contract.project.categories).to.deep.equal(['health', 'data']);
      expect(contract.project.dataNeed).to.be.an('array').with.lengthOf(1);
      expect(contract.project.dataNeed[0].resource).to.equal('resource-A');
      expect(contract.project.serviceNeed[0].service).to.equal('svc-B');
      expect(contract.project.serviceInfrastructures[0].infrastructure).to.equal('infra-C');
      expect(contract.project.contributions[0].contribution).to.equal('Dataset');
      expect(contract.project.participantsAndRoles[0].roles).to.deep.equal(['dataController']);
    });

    it('should default project to null when not provided', async () => {
      const body = await createContract();
      const contract = await getContract(body._id);
      expect(contract.project).to.be.null;
    });
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // ADDITIONAL CLAUSES
  // ══════════════════════════════════════════════════════════════════════════════
  describe('additionalClauses', () => {
    it('should default additionalClauses to null when not provided', async () => {
      const body = await createContract();
      const contract = await getContract(body._id);
      expect(contract.additionalClauses).to.be.null;
    });

    it('should persist reversibilityExit', async () => {
      const body = await createContract({
        additionalClauses: {
          reversibilityExit: { value: 'Return + deletion', deadlineDays: 30 },
        },
      });
      const contract = await getContract(body._id);
      expect(contract.additionalClauses.reversibilityExit.value).to.equal('Return + deletion');
      expect(contract.additionalClauses.reversibilityExit.deadlineDays).to.equal(30);
    });

    it('should persist subcontracting', async () => {
      const body = await createContract({
        additionalClauses: {
          subcontracting: { subcontractors: ['did:sub:1', 'did:sub:2'] },
        },
      });
      const contract = await getContract(body._id);
      expect(contract.additionalClauses.subcontracting.subcontractors).to.deep.equal(['did:sub:1', 'did:sub:2']);
    });

    it('should persist securityIncidentNotification', async () => {
      const body = await createContract({
        additionalClauses: {
          securityIncidentNotification: { value: '72h' },
        },
      });
      const contract = await getContract(body._id);
      expect(contract.additionalClauses.securityIncidentNotification.value).to.equal('72h');
    });

    it('should persist intellectualPropertyOnOutputs', async () => {
      const body = await createContract({
        additionalClauses: {
          intellectualPropertyOnOutputs: { value: 'Consumer owns results' },
        },
      });
      const contract = await getContract(body._id);
      expect(contract.additionalClauses.intellectualPropertyOnOutputs.value).to.equal('Consumer owns results');
    });

    it('should persist governingLawAndJurisdiction', async () => {
      const body = await createContract({
        additionalClauses: {
          governingLawAndJurisdiction: { countryISO: 'FR', disputeMode: 'Arbitration' },
        },
      });
      const contract = await getContract(body._id);
      expect(contract.additionalClauses.governingLawAndJurisdiction.countryISO).to.equal('FR');
      expect(contract.additionalClauses.governingLawAndJurisdiction.disputeMode).to.equal('Arbitration');
    });

    it('should persist forceMajeure', async () => {
      const body = await createContract({
        additionalClauses: { forceMajeure: { value: 'Standard + epidemic' } },
      });
      const contract = await getContract(body._id);
      expect(contract.additionalClauses.forceMajeure.value).to.equal('Standard + epidemic');
    });

    it('should persist auditRight', async () => {
      const body = await createContract({
        additionalClauses: {
          auditRight: { value: 'Third-party audit', frequency: 'Annual' },
        },
      });
      const contract = await getContract(body._id);
      expect(contract.additionalClauses.auditRight.value).to.equal('Third-party audit');
      expect(contract.additionalClauses.auditRight.frequency).to.equal('Annual');
    });

    it('should persist confidentiality', async () => {
      const body = await createContract({
        additionalClauses: {
          confidentiality: { value: 'Mutual NDA', survivalYears: 3 },
        },
      });
      const contract = await getContract(body._id);
      expect(contract.additionalClauses.confidentiality.value).to.equal('Mutual NDA');
      expect(contract.additionalClauses.confidentiality.survivalYears).to.equal(3);
    });

    it('should persist amendmentModification', async () => {
      const body = await createContract({
        additionalClauses: {
          amendmentModification: { value: 'Mutual agreement' },
        },
      });
      const contract = await getContract(body._id);
      expect(contract.additionalClauses.amendmentModification.value).to.equal('Mutual agreement');
    });

    it('should persist all additionalClauses fields at once', async () => {
      const additionalClauses = {
        reversibilityExit: { value: 'Data deletion only', deadlineDays: 60 },
        subcontracting: { subcontractors: ['did:sub:X'] },
        securityIncidentNotification: { value: '24h' },
        intellectualPropertyOnOutputs: { value: 'Joint ownership' },
        governingLawAndJurisdiction: { countryISO: 'DE', disputeMode: 'Courts' },
        forceMajeure: { value: 'Standard clause' },
        auditRight: { value: 'Audit on notice', frequency: 'On suspicion' },
        confidentiality: { value: 'Unilateral NDA', survivalYears: 1 },
        amendmentModification: { value: 'Written amendment only' },
      };
      const body = await createContract({ additionalClauses });
      const contract = await getContract(body._id);
      const ac = contract.additionalClauses;
      expect(ac.reversibilityExit.deadlineDays).to.equal(60);
      expect(ac.subcontracting.subcontractors).to.deep.equal(['did:sub:X']);
      expect(ac.securityIncidentNotification.value).to.equal('24h');
      expect(ac.intellectualPropertyOnOutputs.value).to.equal('Joint ownership');
      expect(ac.governingLawAndJurisdiction.countryISO).to.equal('DE');
      expect(ac.forceMajeure.value).to.equal('Standard clause');
      expect(ac.auditRight.frequency).to.equal('On suspicion');
      expect(ac.confidentiality.survivalYears).to.equal(1);
      expect(ac.amendmentModification.value).to.equal('Written amendment only');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // OFFERING-LEVEL FIELDS
  // ══════════════════════════════════════════════════════════════════════════════
  describe('serviceOfferings – new offering-level fields', () => {

    // ── Offer identification ────────────────────────────────────────────────
    describe('offerName / offerId / offerCaption', () => {
      it('should persist offerName, offerId, offerCaption', async () => {
        const body = await createContract({
          serviceOfferings: [
            {
              ...baseOffering(),
              offerName: 'Premium Data Pack',
              offerId: 'offer-42',
              offerCaption: 'Best deal',
            },
          ],
        });
        const contract = await getContract(body._id);
        const offering = contract.serviceOfferings[0];
        expect(offering.offerName).to.equal('Premium Data Pack');
        expect(offering.offerId).to.equal('offer-42');
        expect(offering.offerCaption).to.equal('Best deal');
      });
    });

    // ── Resources ──────────────────────────────────────────────────────────
    describe('resources', () => {
      it('should default resources to empty array', async () => {
        const body = await createContract({ serviceOfferings: [baseOffering()] });
        const contract = await getContract(body._id);
        expect(contract.serviceOfferings[0].resources).to.be.an('array').that.is.empty;
      });

      it('should persist basic resource fields', async () => {
        const body = await createContract({
          serviceOfferings: [
            {
              ...baseOffering(),
              resources: [
                {
                  resourceName: 'Patient Records',
                  resourceId: 'res-001',
                  resourceDescription: 'Anonymized patient data',
                },
              ],
            },
          ],
        });
        const contract = await getContract(body._id);
        const res = contract.serviceOfferings[0].resources[0];
        expect(res.resourceName).to.equal('Patient Records');
        expect(res.resourceId).to.equal('res-001');
        expect(res.resourceDescription).to.equal('Anonymized patient data');
      });

      it('should persist piiInformation inside a resource', async () => {
        const pii = {
          dataUserRole: 'dataProcessor',
          processingPurposes: ['analytics', 'billing'],
          legalBasis: 'Legitimate interest',
          usageRestrictions: ['no-resale'],
          dpoContact: { name: 'Alice', email: 'alice@org.com', phone: '+33600000000' },
          plannedProcessingActivities: ['profiling'],
          dataCategories: ['health'],
          dataSubjectCategories: ['patients'],
          dataVolumeRange: '1000-10000',
          subProcessorsInvolved: [{ name: 'SubCo', role: 'storage' }],
          transferOutsideEEA: {
            hasTransfer: true,
            countries: ['US'],
            activities: ['storage'],
            safeguards: ['SCCs'],
          },
          subsequentSubProcessingNoticePeriod: 30,
          dataSubjectRightsAssistanceDelay: 7,
          securityBreachAssistanceDelay: '72h',
          auditNoticePeriod: 14,
          subsequentControllerReuseAuthorization: { authorized: false, details: 'Not allowed' },
          securityMeasures: { encryption: true },
          securityCertificationStandard: ['ISO27001', 'ISO27701'],
          securityCertificationDate: new Date('2024-01-01').toISOString(),
          securityCertificationExpiryDate: new Date('2027-01-01').toISOString(),
        };

        const body = await createContract({
          serviceOfferings: [
            { ...baseOffering(), resources: [{ resourceName: 'PII Resource', piiInformation: pii }] },
          ],
        });
        const contract = await getContract(body._id);
        const piStored = contract.serviceOfferings[0].resources[0].piiInformation;
        expect(piStored.dataUserRole).to.equal('dataProcessor');
        expect(piStored.processingPurposes).to.deep.equal(['analytics', 'billing']);
        expect(piStored.dpoContact.email).to.equal('alice@org.com');
        expect(piStored.transferOutsideEEA.countries).to.deep.equal(['US']);
        expect(piStored.securityCertificationStandard).to.deep.equal(['ISO27001', 'ISO27701']);
        expect(piStored.subsequentSubProcessingNoticePeriod).to.equal(30);
        expect(piStored.subsequentControllerReuseAuthorization.authorized).to.equal(false);
      });
    });

    // ── Pricing ────────────────────────────────────────────────────────────
    describe('pricing', () => {
      it('should persist pricing fields', async () => {
        const body = await createContract({
          serviceOfferings: [
            {
              ...baseOffering(),
              pricing: { value: 99.9, billingPeriod: 'monthly', setupFee: 50, description: 'Standard plan' },
            },
          ],
        });
        const contract = await getContract(body._id);
        const pricing = contract.serviceOfferings[0].pricing;
        expect(pricing.value).to.equal(99.9);
        expect(pricing.billingPeriod).to.equal('monthly');
        expect(pricing.setupFee).to.equal(50);
        expect(pricing.description).to.equal('Standard plan');
      });
    });

    // ── SLA ────────────────────────────────────────────────────────────────
    describe('sla', () => {
      it('should persist SLA fields', async () => {
        const sla = {
          deliveryDeadline: { value: 5, unit: 'business days' },
          availability: '99.9%',
          updateFrequency: 'Daily',
          responseTime: { value: 200, unit: 'ms', measurementBasis: 'p95' },
          availabilityTimeWindow: { value: '24/7', timezone: 'Europe/Paris' },
          retentionPeriod: 365,
          availabilityPeriod: '1 year',
          endOfSupportDate: '30 days after contract ends',
          endOfLifeDate: 'Contract duration',
          supportChannels: ['Email', 'Ticketing portal'],
          supportServiceHours: 'Business hours 5x8',
          supportSeverityLevel: [{ level: 'High', responseTimeValue: 4, responseTimeUnit: 'hours' }],
          measurementMonitoringMethod: 'Automated dashboard',
          note: 'SLA reviewed annually',
        };
        const body = await createContract({
          serviceOfferings: [{ ...baseOffering(), sla }],
        });
        const contract = await getContract(body._id);
        const storedSla = contract.serviceOfferings[0].sla;
        expect(storedSla.availability).to.equal('99.9%');
        expect(storedSla.updateFrequency).to.equal('Daily');
        expect(storedSla.deliveryDeadline.unit).to.equal('business days');
        expect(storedSla.responseTime.measurementBasis).to.equal('p95');
        expect(storedSla.availabilityTimeWindow.timezone).to.equal('Europe/Paris');
        expect(storedSla.supportChannels).to.deep.equal(['Email', 'Ticketing portal']);
        expect(storedSla.supportSeverityLevel[0].level).to.equal('High');
        // Aligned on ServiceOffering.sla: numeric retention, the duration enum
        // moved to `availabilityPeriod`, and the end-of-* dates are enums.
        expect(storedSla.retentionPeriod).to.equal(365);
        expect(storedSla.availabilityPeriod).to.equal('1 year');
        expect(storedSla.endOfSupportDate).to.equal(
          '30 days after contract ends',
        );
        expect(storedSla.endOfLifeDate).to.equal('Contract duration');
      });
    });

    // ── Commitments ────────────────────────────────────────────────────────
    describe('commitments', () => {
      it('should persist commitment entries', async () => {
        const commitment = {
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
          note: 'Capped at 30% per month',
        };
        const body = await createContract({
          serviceOfferings: [{ ...baseOffering(), commitments: [commitment] }],
        });
        const contract = await getContract(body._id);
        const stored = contract.serviceOfferings[0].commitments[0];
        expect(stored.commitmentConcerned).to.equal('availability');
        expect(stored.consequenceType).to.equal('Service credit');
        expect(stored.penaltyAmount).to.equal(10);
        expect(stored.penaltyBasis).to.equal('% of period fee');
        expect(stored.claimProcedure).to.equal('Automatic credit');
        expect(stored.claimDeadlineDays).to.equal(30);
      });
    });

    // ── Contract Duration ──────────────────────────────────────────────────
    describe('contractDuration', () => {
      it('should persist contractDuration', async () => {
        const body = await createContract({
          serviceOfferings: [
            {
              ...baseOffering(),
              contractDuration: {
                value: 12,
                unit: 'months',
                renewalMode: 'Automatic renewal',
                noticePeriodDays: 30,
              },
            },
          ],
        });
        const contract = await getContract(body._id);
        const cd = contract.serviceOfferings[0].contractDuration;
        expect(cd.value).to.equal(12);
        expect(cd.unit).to.equal('months');
        expect(cd.renewalMode).to.equal('Automatic renewal');
        expect(cd.noticePeriodDays).to.equal(30);
      });
    });

    // ── Termination for Convenience ────────────────────────────────────────
    describe('terminationForConvenience', () => {
      it('should persist terminationForConvenience', async () => {
        const body = await createContract({
          serviceOfferings: [
            {
              ...baseOffering(),
              terminationForConvenience: { allowed: true, noticePeriodDays: 60 },
            },
          ],
        });
        const contract = await getContract(body._id);
        const tfc = contract.serviceOfferings[0].terminationForConvenience;
        expect(tfc.allowed).to.equal(true);
        expect(tfc.noticePeriodDays).to.equal(60);
      });

      it('should default terminationForConvenience.allowed to false', async () => {
        const body = await createContract({
          serviceOfferings: [{ ...baseOffering(), terminationForConvenience: {} }],
        });
        const contract = await getContract(body._id);
        expect(contract.serviceOfferings[0].terminationForConvenience.allowed).to.equal(false);
      });
    });

    // ── Termination for Cause ──────────────────────────────────────────────
    describe('terminationForCause', () => {
      it('should persist terminationForCause', async () => {
        const body = await createContract({
          serviceOfferings: [
            {
              ...baseOffering(),
              terminationForCause: {
                breachThreshold: 3,
                noticePeriod: 'X days notice',
                noticePeriodDays: 15,
                regulatoryOrSecurityTermination: 'Yes (immediate)',
                regulatoryNoticeDays: 0,
              },
            },
          ],
        });
        const contract = await getContract(body._id);
        const tfc = contract.serviceOfferings[0].terminationForCause;
        expect(tfc.breachThreshold).to.equal(3);
        expect(tfc.noticePeriod).to.equal('X days notice');
        expect(tfc.noticePeriodDays).to.equal(15);
        expect(tfc.regulatoryOrSecurityTermination).to.equal('Yes (immediate)');
      });
    });

    // ── Penalties & Termination Link ───────────────────────────────────────
    describe('penaltiesTerminationLink', () => {
      it('should persist penaltiesTerminationLink', async () => {
        const body = await createContract({
          serviceOfferings: [
            {
              ...baseOffering(),
              penaltiesTerminationLink: {
                cumulativePenaltyCapTermination: true,
                suspensionBeforeTermination: true,
                suspensionDurationDays: 30,
              },
            },
          ],
        });
        const contract = await getContract(body._id);
        const ptl = contract.serviceOfferings[0].penaltiesTerminationLink;
        expect(ptl.cumulativePenaltyCapTermination).to.equal(true);
        expect(ptl.suspensionBeforeTermination).to.equal(true);
        expect(ptl.suspensionDurationDays).to.equal(30);
      });

      it('should default boolean flags to false', async () => {
        const body = await createContract({
          serviceOfferings: [{ ...baseOffering(), penaltiesTerminationLink: {} }],
        });
        const contract = await getContract(body._id);
        const ptl = contract.serviceOfferings[0].penaltiesTerminationLink;
        expect(ptl.cumulativePenaltyCapTermination).to.equal(false);
        expect(ptl.suspensionBeforeTermination).to.equal(false);
      });
    });

    // ── Offering-level customFields ────────────────────────────────────────
    describe('customFields (offering level)', () => {
      it('should persist customFields inside an offering', async () => {
        const body = await createContract({
          serviceOfferings: [
            { ...baseOffering(), customFields: { legalCode: 'L123', sector: 'finance' } },
          ],
        });
        const contract = await getContract(body._id);
        expect(contract.serviceOfferings[0].customFields).to.deep.include({ legalCode: 'L123', sector: 'finance' });
      });

      it('should default offering customFields to null', async () => {
        const body = await createContract({ serviceOfferings: [baseOffering()] });
        const contract = await getContract(body._id);
        expect(contract.serviceOfferings[0].customFields).to.be.null;
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // UPDATE via PUT – verify fields survive a patch
  // ══════════════════════════════════════════════════════════════════════════════
  describe('Fields survival through PUT update', () => {
    it('should update additionalClauses via PUT', async () => {
      const body = await createContract({
        additionalClauses: { forceMajeure: { value: 'None' } },
      });
      await updateContract(body._id, {
        additionalClauses: { forceMajeure: { value: 'Standard clause' } },
      });
      const contract = await getContract(body._id);
      expect(contract.additionalClauses.forceMajeure.value).to.equal('Standard clause');
    });

    it('should update project fields via PUT', async () => {
      const body = await createContract({ project: { title: 'Old title' } });
      await updateContract(body._id, { project: { title: 'New title', caption: 'Updated' } });
      const contract = await getContract(body._id);
      expect(contract.project.title).to.equal('New title');
      expect(contract.project.caption).to.equal('Updated');
    });

    it('should update contract-level customFields via PUT', async () => {
      const body = await createContract({ customFields: { v: 1 } });
      await updateContract(body._id, { customFields: { v: 2, extra: true } });
      const contract = await getContract(body._id);
      expect(contract.customFields.v).to.equal(2);
      expect(contract.customFields.extra).to.equal(true);
    });
  });
});

