/**
 * Level 1 of the contract flattening test plan: backward compatibility.
 *
 * Connectors deployed in production read the contract over a plain
 * `GET /contracts/:id` and trigger data exchanges from what they find. This file
 * pins the contract of that read down:
 *
 * - a legacy, pre-flattening contract stays readable, updatable and injectable;
 * - a flattened contract still exposes every historical key, at the same path,
 *   with the same type, so a 1.11.0 connector behaves identically;
 * - no historical key path disappears when flattened data is added.
 *
 * The paths asserted below are the ones a 1.11.0 connector actually reads:
 * `serviceOfferings[].participant` / `.serviceOffering` /
 * `.policies[].permission[].target`, `serviceChains[].catalogId` /
 * `.serviceChainId` / `.services[].{service,participant,params,configuration,
 * incentivePoints,pre}`, plus `ecosystem`, `orchestrator`, `status`, `members[]`
 * and `useDVCT`.
 */
import supertest from 'supertest';
import { expect } from 'chai';
import app from 'server';
import Contract from 'models/contract.model';
import { ContractService } from 'services/contract.service';
import { config } from 'config/config';

const SERVER_PORT = 9997;
const API_ROUTE_BASE = '/contracts/';

describe('Backward compatibility of the flattened contract', () => {
  let server: any;
  let authTokenCookie: any;
  let contractService: ContractService;
  const createdIds: string[] = [];

  // ─── Fixtures ───────────────────────────────────────────────────────────────

  /**
   * A contract as the service wrote them before any flattening, taken from a real
   * production document: `ecosystem`/`orchestrator` as self-description URLs, a
   * `dataProcessings` key that no longer exists in the schema, `serviceChains`
   * entries carrying `status` and `_id`, and no `project`/`additionalClauses`.
   *
   * It is inserted straight into the collection, bypassing mongoose casting, so
   * the test really exercises reading a document this code did not write.
   */
  const legacyContract = () => ({
    ecosystem: 'http://catalog.test/v1/catalog/ecosystems/68497efd0b16fbce013',
    orchestrator:
      'http://catalog.test/v1/catalog/participants/66d18724ee71f9f096bae810',
    rolesAndObligations: [],
    status: 'signed',
    serviceOfferings: [
      {
        participant:
          'http://catalog.test/v1/catalog/participants/66d18724ee71f9f096bae810',
        serviceOffering:
          'http://catalog.test/v1/catalog/serviceofferings/66d187f4ee71f9f096bae8ca',
        policies: [
          {
            description: 'CAN use data without any restrictions',
            permission: [
              {
                action: 'use',
                target:
                  'http://catalog.test/v1/catalog/serviceofferings/66d187f4ee71f9f096bae8ca',
                duty: [],
                constraint: [],
              },
            ],
            prohibition: [],
          },
        ],
      },
    ],
    // Key dropped from the schema long ago; a legacy document still carries it.
    dataProcessings: [],
    purpose: [],
    members: [
      {
        participant:
          'http://catalog.test/v1/catalog/participants/66d18724ee71f9f096bae810',
        role: 'orchestrator',
        signature: 'signed',
        date: new Date('2025-06-11T13:07:15.329Z'),
      },
    ],
    revokedMembers: [],
    serviceChains: [
      {
        catalogId: '68497ffe81f46fc932afa839',
        services: [
          {
            participant:
              'http://catalog.test/v1/catalog/participants/66d18724ee71f9f096bae810',
            service:
              'http://catalog.test/v1/catalog/serviceofferings/66d187f4ee71f9f096bae8ca',
            params: '',
            configuration: '',
            pre: [],
          },
        ],
        status: 'active',
      },
    ],
    createdAt: new Date('2025-06-11T13:05:01.351Z'),
    updatedAt: new Date('2025-06-11T13:11:19.031Z'),
    __v: 4,
  });

  /** The flattened data an offering injection now carries. */
  const flattenedOfferingFields = () => ({
    offerId: 'offer-42',
    offerName: 'Premium Health Data Pack',
    offerCaption: 'Anonymized patient dataset for research',
    pricing: {
      value: 299.9,
      billingPeriod: 'monthly',
      setupFee: 500,
      description: 'Monthly subscription',
      currency: 'EUR',
      costPerAPICall: 0.01,
      pricingModel: ['subscription'],
    },
    sla: {
      availability: '99.9%',
      retentionPeriod: 365,
      availabilityPeriod: '1 year',
      endOfSupportDate: '30 days after contract ends',
      endOfLifeDate: 'Contract duration',
    },
    dataResources: [
      {
        resourceId: 'res-001',
        resourceName: 'Patient Records 2024',
        containsPII: true,
        representation: {
          method: 'GET',
          url: 'https://provider.test/datasets/patient-records',
          credential: 'cred-1',
          mimeType: 'application/json',
          proxy: {
            protocol: 'http',
            host: 'proxy.test',
            port: 8080,
            credential: 'proxy-cred',
          },
        },
      },
    ],
    softwareResources: [
      {
        resourceId: 'soft-001',
        resourceName: 'Diagnosis model',
        usePII: false,
        piiInformation: { dataUserRole: 'dataProcessor' },
      },
    ],
    packages: [
      {
        pricing: 99.9,
        currency: 'EUR',
        billingPeriod: 'monthly',
      },
    ],
    customFields: { sector: 'healthcare' },
  });

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /** Inserts a document verbatim, bypassing mongoose casting. */
  async function insertLegacyContract(doc: object): Promise<string> {
    const result = await Contract.collection.insertOne(doc as any);
    const id = result.insertedId.toString();
    createdIds.push(id);
    return id;
  }

  async function getContract(id: string, expectedStatus = 200): Promise<any> {
    const response = await supertest(app.router)
      .get(`${API_ROUTE_BASE}${id}`)
      .set('Cookie', authTokenCookie);
    expect(response.status).to.equal(expectedStatus);
    return response.body;
  }

  /**
   * Every leaf key path of an object, with array indices collapsed to `[]` so two
   * contracts with different cardinalities remain comparable.
   */
  function keyPaths(value: any, prefix = ''): string[] {
    if (Array.isArray(value)) {
      return [
        ...new Set(value.flatMap((item) => keyPaths(item, `${prefix}[]`))),
      ];
    }
    if (value !== null && typeof value === 'object') {
      return Object.entries(value).flatMap(([key, child]) =>
        keyPaths(child, prefix ? `${prefix}.${key}` : key),
      );
    }
    return [prefix];
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────
  before(async () => {
    server = await app.startServer(config.mongo.testUrl);
    await new Promise((resolve) => {
      server.listen(SERVER_PORT, () => resolve(true));
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
  });

  // ══════════════════════════════════════════════════════════════════════════
  // A contract must stay readable whatever its status
  // ══════════════════════════════════════════════════════════════════════════
  describe('GET /contracts/:id is unconditional', () => {
    it('serves a pending contract', async () => {
      const id = await insertLegacyContract({
        ...legacyContract(),
        status: 'pending',
      });

      const contract = await getContract(id);
      expect(contract.status).to.equal('pending');
      expect(contract.serviceOfferings).to.have.lengthOf(1);
    });

    it('serves a revoked contract', async () => {
      const id = await insertLegacyContract({
        ...legacyContract(),
        status: 'revoked',
      });

      const contract = await getContract(id);
      expect(contract.status).to.equal('revoked');
    });

    it('serves a signed contract', async () => {
      const id = await insertLegacyContract(legacyContract());

      const contract = await getContract(id);
      expect(contract.status).to.equal('signed');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Legacy documents survive every operation
  // ══════════════════════════════════════════════════════════════════════════
  describe('a legacy contract stays usable', () => {
    it('is read with every historical field at its original path and type', async () => {
      const id = await insertLegacyContract(legacyContract());
      const contract = await getContract(id);

      expect(contract.ecosystem).to.be.a('string');
      expect(contract.ecosystem).to.equal(legacyContract().ecosystem);
      expect(contract.orchestrator).to.be.a('string');
      expect(contract.status).to.equal('signed');

      const offering = contract.serviceOfferings[0];
      expect(offering.participant).to.be.a('string');
      expect(offering.serviceOffering).to.be.a('string');
      expect(offering.policies[0].permission[0].target).to.be.a('string');
      expect(offering.policies[0].permission[0].action).to.equal('use');

      const chain = contract.serviceChains[0];
      expect(chain.catalogId).to.be.a('string');
      expect(chain.services[0].service).to.be.a('string');
      expect(chain.services[0].participant).to.be.a('string');

      expect(contract.members[0].participant).to.be.a('string');
      expect(contract.members[0].role).to.equal('orchestrator');
      expect(contract.members[0].signature).to.equal('signed');
    });

    it('is updated without losing its historical fields', async () => {
      const id = await insertLegacyContract(legacyContract());

      const response = await supertest(app.router)
        .put(`${API_ROUTE_BASE}${id}`)
        .set('Cookie', authTokenCookie)
        .send({ useDVCT: true });
      expect(response.status).to.equal(200);

      const contract = await getContract(id);
      expect(contract.useDVCT).to.equal(true);
      expect(contract.ecosystem).to.equal(legacyContract().ecosystem);
      expect(contract.serviceOfferings[0].serviceOffering).to.equal(
        legacyContract().serviceOfferings[0].serviceOffering,
      );
      expect(contract.serviceChains[0].services[0].service).to.be.a('string');
    });

    it('accepts a policy-only offering injection, as deployed callers send', async () => {
      const id = await insertLegacyContract(legacyContract());
      const { participant, serviceOffering } =
        legacyContract().serviceOfferings[0];

      const response = await supertest(app.router)
        .put(`${API_ROUTE_BASE}policies/offering/${id}`)
        .set('Cookie', authTokenCookie)
        .send({ participant, serviceOffering, policies: [] });
      expect(response.status).to.equal(200);

      const contract = await getContract(id);
      expect(contract.serviceOfferings).to.have.lengthOf(1);
      expect(contract.serviceOfferings[0].participant).to.equal(participant);
      expect(
        contract.serviceOfferings[0].policies[0].permission[0].target,
      ).to.be.a('string');
    });

    it('is signed without losing its historical fields', async () => {
      const id = await insertLegacyContract(legacyContract());

      const response = await supertest(app.router)
        .put(`${API_ROUTE_BASE}sign/${id}`)
        .set('Cookie', authTokenCookie)
        .send({
          participant: 'http://catalog.test/v1/catalog/participants/new-member',
          role: 'participant',
          signature: 'sig-1',
        });
      expect(response.status).to.equal(200);

      const contract = await getContract(id);
      expect(contract.members).to.have.lengthOf(2);
      expect(contract.ecosystem).to.equal(legacyContract().ecosystem);
      expect(contract.serviceChains[0].services[0].service).to.be.a('string');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Flattening is additive: nothing historical moves
  // ══════════════════════════════════════════════════════════════════════════
  describe('flattening only adds keys', () => {
    it('leaves every historical key path in place after an injection', async () => {
      const id = await insertLegacyContract(legacyContract());
      const before = keyPaths(await getContract(id));

      const { participant, serviceOffering } =
        legacyContract().serviceOfferings[0];
      const response = await supertest(app.router)
        .put(`${API_ROUTE_BASE}policies/offering/${id}`)
        .set('Cookie', authTokenCookie)
        .send({
          participant,
          serviceOffering,
          policies: [],
          ...flattenedOfferingFields(),
        });
      expect(response.status).to.equal(200);

      const after = keyPaths(await getContract(id));
      const removed = before.filter((path) => !after.includes(path));

      expect(removed, `key paths disappeared: ${removed.join(', ')}`).to.be
        .empty;
      // And the injection did add something.
      expect(after.length).to.be.greaterThan(before.length);
    });

    it('does not overwrite frozen data when a later injection carries none', async () => {
      const id = await insertLegacyContract(legacyContract());
      const { participant, serviceOffering } =
        legacyContract().serviceOfferings[0];

      await supertest(app.router)
        .put(`${API_ROUTE_BASE}policies/offering/${id}`)
        .set('Cookie', authTokenCookie)
        .send({
          participant,
          serviceOffering,
          policies: [],
          ...flattenedOfferingFields(),
        });

      // A caller running the previous version of the API sends policies only.
      await supertest(app.router)
        .put(`${API_ROUTE_BASE}policies/offering/${id}`)
        .set('Cookie', authTokenCookie)
        .send({ participant, serviceOffering, policies: [] });

      const contract = await getContract(id);
      const offering = contract.serviceOfferings[0];
      expect(offering.offerName).to.equal('Premium Health Data Pack');
      expect(offering.sla.retentionPeriod).to.equal(365);
      expect(offering.dataResources).to.have.lengthOf(1);
    });

    it('persists the flattened offering exactly as sent', async () => {
      const id = await insertLegacyContract(legacyContract());
      const { participant, serviceOffering } =
        legacyContract().serviceOfferings[0];

      await supertest(app.router)
        .put(`${API_ROUTE_BASE}policies/offering/${id}`)
        .set('Cookie', authTokenCookie)
        .send({
          participant,
          serviceOffering,
          policies: [],
          ...flattenedOfferingFields(),
        });

      const offering = (await getContract(id)).serviceOfferings[0];

      expect(offering.offerId).to.equal('offer-42');
      expect(offering.offerCaption).to.equal(
        'Anonymized patient dataset for research',
      );
      expect(offering.pricing.currency).to.equal('EUR');
      expect(offering.pricing.costPerAPICall).to.equal(0.01);
      expect(offering.pricing.pricingModel).to.deep.equal(['subscription']);
      expect(offering.sla.availabilityPeriod).to.equal('1 year');
      expect(offering.sla.endOfSupportDate).to.equal(
        '30 days after contract ends',
      );
      expect(offering.packages[0].pricing).to.equal(99.9);
      expect(offering.customFields.sector).to.equal('healthcare');

      const dataResource = offering.dataResources[0];
      expect(dataResource.containsPII).to.equal(true);
      expect(dataResource.representation.url).to.equal(
        'https://provider.test/datasets/patient-records',
      );
      // The proxy must be host/port/protocol shaped, as the connector consumes it.
      expect(dataResource.representation.proxy.host).to.equal('proxy.test');
      expect(dataResource.representation.proxy.port).to.equal(8080);
      expect(dataResource.representation.proxy.protocol).to.equal('http');
      expect(dataResource.representation.proxy).to.not.have.property('url');

      const softwareResource = offering.softwareResources[0];
      expect(softwareResource.usePII).to.equal(false);
      expect(softwareResource.piiInformation.dataUserRole).to.equal(
        'dataProcessor',
      );
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // What a 1.11.0 connector reads out of a flattened contract
  // ══════════════════════════════════════════════════════════════════════════
  describe('a 1.11.0 connector can still trigger an exchange', () => {
    it('finds every key it reads, at the same path and type', async () => {
      const id = await insertLegacyContract({
        ...legacyContract(),
        // A fully flattened contract: root project data plus a chain whose
        // services carry both the historical keys and the new ones.
        project: { title: 'Cross-Border Health Analytics', treatment: 'agg' },
        additionalClauses: { confidentiality: { value: 'Mutual NDA' } },
        customFields: { internalProjectCode: 'HEALTH-2025-001' },
        contractModelVersion: '1.2.0',
        serviceChains: [
          {
            catalogId: 'chain-001',
            serviceChainId: 'chain-001',
            services: [
              {
                participant: 'http://catalog.test/v1/catalog/participants/p-1',
                service:
                  'http://catalog.test/v1/catalog/serviceofferings/offer-1',
                params: '',
                configuration: '',
                incentivePoints: 5,
                pre: [],
                serviceId: 'offer-1',
                order: 1,
                serviceDetails: { offerName: 'Premium Health Data Pack' },
              },
            ],
          },
        ],
      });

      const contract = await getContract(id);

      // pepVerification: needs a non-empty serviceOfferings and string targets.
      expect(contract.serviceOfferings).to.be.an('array').and.not.empty;
      const targets = contract.serviceOfferings.flatMap((offering: any) =>
        offering.policies.flatMap((policy: any) =>
          policy.permission.map((permission: any) => permission.target),
        ),
      );
      expect(targets).to.not.be.empty;
      targets.forEach((target: any) => expect(target).to.be.a('string'));

      // verifyDataProcessingInContract: matches the chain on catalogId.
      const chain = contract.serviceChains.find(
        (element: any) => element.catalogId === 'chain-001',
      );
      expect(chain, 'chain not found by catalogId').to.exist;

      // verifyInfrastructureInContract / nodeSupervisor / dvct: the six keys read
      // on a chain service must stay where they are, with their original types.
      const service = chain.services[0];
      expect(service.service).to.be.a('string');
      expect(service.service).to.equal(
        'http://catalog.test/v1/catalog/serviceofferings/offer-1',
      );
      expect(service.participant).to.be.a('string');
      expect(service.params).to.be.a('string');
      expect(service.configuration).to.be.a('string');
      expect(service.incentivePoints).to.equal(5);
      expect(service.pre).to.be.an('array');

      // The new keys sit next to them without displacing anything.
      expect(service.serviceId).to.equal('offer-1');
      expect(service.order).to.equal(1);
      expect(service.serviceDetails.offerName).to.equal(
        'Premium Health Data Pack',
      );

      // ContractResponseType: the remaining fields the connector types.
      expect(contract.ecosystem).to.be.a('string');
      expect(contract.orchestrator).to.be.a('string');
      expect(contract.status).to.be.a('string');
      expect(contract.rolesAndObligations).to.be.an('array');
      expect(contract.purpose).to.be.an('array');
      expect(contract.members).to.be.an('array');
      expect(contract.revokedMembers).to.be.an('array');
    });

    it('reads dataspaceEndpoint on a member when it was frozen', async () => {
      const id = await insertLegacyContract({
        ...legacyContract(),
        members: [
          {
            participant: 'http://catalog.test/v1/catalog/participants/p-1',
            role: 'orchestrator',
            signature: 'signed',
            dataspaceEndpoint: 'https://provider.test/dataspace',
          },
        ],
      });

      const contract = await getContract(id);
      expect(contract.members[0].dataspaceEndpoint).to.equal(
        'https://provider.test/dataspace',
      );
    });

    it('tolerates a member with no dataspaceEndpoint', async () => {
      const id = await insertLegacyContract(legacyContract());

      const contract = await getContract(id);
      expect(contract.members[0].participant).to.be.a('string');
      expect(contract.members[0].dataspaceEndpoint ?? null).to.equal(null);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Versioning fields are optional
  // ══════════════════════════════════════════════════════════════════════════
  describe('versioning fields never break a legacy contract', () => {
    it('reads a legacy contract that has none of them', async () => {
      const id = await insertLegacyContract(legacyContract());
      const contract = await getContract(id);

      expect(contract.version).to.equal(undefined);
      expect(contract.rootContract ?? null).to.equal(null);
      expect(contract.contractModelVersion).to.equal(undefined);
    });

    it('defaults contractModelVersion on a newly created contract', async () => {
      const response = await supertest(app.router)
        .post(API_ROUTE_BASE)
        .set('Cookie', authTokenCookie)
        .send({ contract: { ecosystem: 'did:eco:1' }, role: 'ecosystem' });
      expect(response.status).to.equal(201);
      createdIds.push(response.body._id);

      expect(response.body.contractModelVersion).to.equal('1.2.0');
      expect(response.body.parent).to.equal(null);
      expect(response.body.child).to.equal(null);
      expect(response.body.rootContract).to.equal(null);
    });
  });
});
