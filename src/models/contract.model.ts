import mongoose, { Schema } from 'mongoose';
import { IContractDB } from '../interfaces/contract.interface';

// Ecosystem Contract Model / Dataspace User Case
const PurposeSchema = new Schema({
  uid: String,
  purpose: String,
  action: String,
  assigner: String,
  assignee: String,
  purposeCategory: String,
  consentType: String,
  piiCategory: String,
  primaryPurpose: String,
  termination: String,
  thirdPartyDisclosure: String,
  thirdPartyName: String,
});

const ConstraintSchema = new Schema(
  {
    '@type': String,
    leftOperand: String,
    operator: String,
    rightOperand: mongoose.Schema.Types.Mixed,
  },
  { strict: false, _id: false },
);

const ConsequenceSchema = new Schema(
  {
    action: String,
    constraint: [ConstraintSchema],
    consequence: [{ type: Schema.Types.Mixed }],
  },
  { _id: false },
);
const DutySchema = new Schema(
  {
    action: String,
    constraint: [ConstraintSchema],
    consequence: [ConsequenceSchema],
  },
  { _id: false },
);
const PolicySchema = new Schema(
  {
    uid: String,
    description: String,
    permission: [
      {
        action: String,
        target: String,
        duty: [DutySchema],
        constraint: [ConstraintSchema],
        _id: false,
      },
    ],
    prohibition: [
      {
        action: String,
        target: String,
        constraint: [ConstraintSchema],
        _id: false,
      },
    ],
  },
  { _id: false },
);

// ─── Representation / Proxy schemas ──────────────────────────────────────────
// Mirrors the catalog's DataRepresentation model. The shape is dictated by what
// the connector consumes in `proxyProcessing` (host/port/protocol/credential),
// not by a URL. `credential` is an id the connector resolves against its own
// local credential store, never a secret value.
const ProxySchema = new Schema(
  {
    protocol: { type: String },
    host: { type: String },
    port: { type: Number },
    credential: { type: String },
  },
  { _id: false },
);

const RepresentationSchema = new Schema(
  {
    method: { type: String },
    url: { type: String },
    credential: { type: String },
    type: { type: String },
    mimeType: { type: String },
    queryParams: { type: [String], default: undefined },
    proxy: { type: ProxySchema, default: null },
  },
  { _id: false },
);

// ─── Resource Schema (one offering can contain N resources) ──────────────────
const ResourceSchema = new Schema(
  {
    resourceName: { type: String },
    resourceId: { type: String },
    resourceDescription: { type: String },

    // Data resource specific. Casing matches the catalog source
    // (DataResource.containsPII) and what the connector reads.
    containsPII: { type: Boolean, default: false },

    // Software resource specific. Casing matches SoftwareResource.usePII.
    usePII: { type: Boolean, default: false },

    // Resource access representations
    representation: { type: RepresentationSchema, default: null },
    apiResponseRepresentation: { type: RepresentationSchema, default: null },

    // ─── Conditional PII fields ───────────────────────────────────────────
    piiInformation: {
      dataUserRole: {
        type: String,
        enum: ['dataController', 'dataProcessor', 'jointDataController'],
      },
      processingPurposes: [{ type: String }],
      legalBasis: { type: String },
      usageRestrictions: [{ type: String }],
      dpoContact: new Schema(
        {
          name: { type: String },
          email: { type: String },
          phone: { type: String },
        },
        { _id: false },
      ),
      plannedProcessingActivities: [{ type: String }],
      dataCategories: [{ type: String }],
      dataSubjectCategories: [{ type: String }],
      dataVolumeRange: {
        type: String,
        enum: ['1-100', '100-1000', '1000-10000', '10000-100000', '100000-1000000', '1000000+'],
      },
      subProcessorsInvolved: [{ type: mongoose.Schema.Types.Mixed }],
      transferOutsideEEA: new Schema(
        {
          hasTransfer: { type: Boolean },
          countries: [{ type: String }],
          activities: [{ type: String }],
          safeguards: [{ type: String }],
        },
        { _id: false },
      ),
      subsequentSubProcessingNoticePeriod: { type: Number },
      dataSubjectRightsAssistanceDelay: { type: Number },
      securityBreachAssistanceDelay: {
        type: String,
        enum: ['reasonableDelay', '72h'],
      },
      auditNoticePeriod: { type: Number },
      subsequentControllerReuseAuthorization: new Schema(
        {
          authorized: { type: Boolean },
          details: { type: String },
        },
        { _id: false },
      ),
      securityMeasures: { type: mongoose.Schema.Types.Mixed },
      securityCertificationStandard: [
        {
          type: String,
          enum: ['ISO27001', 'ISO27701', 'ISO9001', 'Europrivacy', 'SOC2', 'SECNUMCLOUD'],
        },
      ],
      securityCertificationDate: { type: Date },
      securityCertificationExpiryDate: { type: Date },
    },
  },
  { _id: false },
);

const MemberSchema = new Schema(
  {
    participant: { type: String, required: true },
    role: { type: String, required: true },
    signature: { type: String, required: true },
    dataspaceEndpoint: { type: String, default: null },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const ServiceChainSchema = new Schema({
    catalogId: { type: String, required: false },
    serviceChainId: { type: String, required: false },
    services: { type: [mongoose.Schema.Types.Mixed], default: [] }, // Changed to Mixed
    },
    { _id: false },
);

// const InfrastructureServiceSchema: any = new Schema({
//     participant: { type: String, required: true },
//     service: { type: String, required: true },
//     pre: { type: [mongoose.Schema.Types.Mixed], default: [] } as any, // Changed to Mixed
// });

const ProjectDataNeedSchema = new Schema(
  {
    resource: { type: String },
    description: { type: String },
  },
  { _id: false },
);

const ProjectServiceNeedSchema = new Schema(
  {
    service: { type: String },
    description: { type: String },
  },
  { _id: false },
);

const ProjectServiceInfrastructureSchema = new Schema(
  {
    infrastructure: { type: String },
    description: { type: String },
  },
  { _id: false },
);

const ProjectContributionSchema = new Schema(
  {
    contribution: { type: String },
    description: { type: String },
  },
  { _id: false },
);
const ProjectParticipantRoleSchema = new Schema(
  {
    participant: { type: String },
    roles: { type: [String], default: [] },
  },
  { _id: false },
);

const ReversibilityExitSchema = new Schema(
  {
    value: {
      type: String,
      enum: ['None', 'Data deletion only', 'Return + deletion', 'Return + deletion + destruction certificate'],
      default: 'None',
    },
    deadlineDays: {
      type: Number,
      enum: [30, 60, 90],
    },
  },
  { _id: false },
);

const SubcontractingSchema = new Schema(
  {
    subcontractors: { type: [String], default: [] },
  },
  { _id: false },
);

const SecurityIncidentNotificationSchema = new Schema(
  {
    value: {
      type: String,
      enum: ['Without undue delay', '24h', '48h', '72h'],
      default: 'Without undue delay',
    },
  },
  { _id: false },
);

const IntellectualPropertyOnOutputsSchema = new Schema(
  {
    value: {
      type: String,
      enum: ['Provider retains all', 'Consumer owns results', 'Joint ownership', 'Licensed back', 'No derivative rights'],
      default: 'Provider retains all',
    },
  },
  { _id: false },
);

const GoverningLawSchema = new Schema(
  {
    countryISO: { type: String },
    disputeMode: {
      type: String,
      enum: ['Courts', 'Arbitration', 'Mediation then arbitration'],
    },
  },
  { _id: false },
);

const ForceMajeureSchema = new Schema(
  {
    value: {
      type: String,
      enum: ['Standard clause', 'Standard + epidemic', 'None'],
      default: 'Standard clause',
    },
  },
  { _id: false },
);

const AuditRightSchema = new Schema(
  {
    value: {
      type: String,
      enum: ['None', 'Self-certification', 'Audit on notice', 'Third-party audit', 'Regulator access'],
      default: 'None',
    },
    frequency: {
      type: String,
      enum: ['Annual', 'On suspicion', 'Once per contract'],
    },
  },
  { _id: false },
);

const ConfidentialitySchema = new Schema(
  {
    value: {
      type: String,
      enum: ['None', 'Mutual NDA', 'Unilateral NDA'],
      default: 'None',
    },
    survivalYears: {
      type: Number,
      enum: [1, 3, 5],
    },
  },
  { _id: false },
);

const AmendmentModificationSchema = new Schema(
  {
    value: {
      type: String,
      enum: ['Written amendment only', 'Mutual agreement', 'With notice'],
      default: 'Written amendment only',
    },
  },
  { _id: false },
);

const ProjectSchema = new Schema(
  {
    // Project Information
    title: { type: String },
    caption: { type: String },
    description: { type: String },
    categories: { type: [String], default: [] },
    countryOrRegion: { type: String },
    picture: { type: String },

    // Project Governance
    purpose: { type: String },
    benefit: { type: String },

    // Data Processing
    treatment: { type: String },
    desiredDataAvailabilityDate: { type: Date },
    legalBasisOfProcessing: { type: String },
    legalBasisDescription: { type: String },

    // Project Needs
    dataNeed: { type: [ProjectDataNeedSchema], default: [] },
    serviceNeed: { type: [ProjectServiceNeedSchema], default: [] },
    serviceInfrastructures: { type: [ProjectServiceInfrastructureSchema], default: [] },
    criteriaAndConditions: { type: String },

    // Project Contributions
    contributions: { type: [ProjectContributionSchema], default: [] },

    // Participants & Roles
    participantsAndRoles: { type: [ProjectParticipantRoleSchema], default: [] },
  },
  { _id: false },
);

const AdditionalClausesSchema = new Schema(
  {
    reversibilityExit: { type: ReversibilityExitSchema, default: null },
    subcontracting: { type: SubcontractingSchema, default: null },
    securityIncidentNotification: { type: SecurityIncidentNotificationSchema, default: null },
    intellectualPropertyOnOutputs: { type: IntellectualPropertyOnOutputsSchema, default: null },
    governingLawAndJurisdiction: { type: GoverningLawSchema, default: null },
    forceMajeure: { type: ForceMajeureSchema, default: null },
    auditRight: { type: AuditRightSchema, default: null },
    confidentiality: { type: ConfidentialitySchema, default: null },
    amendmentModification: { type: AmendmentModificationSchema, default: null },
  },
  { _id: false },
);

// ─── Package Schema (pricing variants of an offering) ────────────────────────
const PackageSchema = new Schema(
  {
    pricing: { type: Number },
    currency: { type: String },
    billingPeriod: { type: String },
    costPerAPICall: { type: Number },
    setupFee: { type: Number },
    pricingDescription: { type: String },

    // Raw catalog policies, kept as Mixed so no unknown key is dropped.
    policy: { type: [mongoose.Schema.Types.Mixed], default: undefined },

    // Resources scoped to this package, flattened like the offering-level ones.
    dataResources: { type: [ResourceSchema], default: undefined },
    softwareResources: { type: [ResourceSchema], default: undefined },
  },
  { _id: false },
);

const OfferingSchema = new Schema({
    participant: { type: String, required: true },
    serviceOffering: { type: String, required: true },
    policies: [PolicySchema],

    // Offer
    offerName: { type: String },
    offerId: { type: String },
    offerCaption: { type: String },

    // Resources – generic (legacy)
    resources: { type: [ResourceSchema], default: [] },

    // Resources – typed
    dataResources: { type: [ResourceSchema], default: [] },
    softwareResources: { type: [ResourceSchema], default: [] },

    // Pricing
    pricing: new Schema(
        {
            value: { type: Number },
            billingPeriod: { type: String },
            setupFee: { type: Number },
            description: { type: String },
            currency: { type: String },
            costPerAPICall: { type: Number },
            pricingModel: { type: [String], default: undefined },
        },
        { _id: false },
    ),

    // Pricing variants of the offering. Mirrors the catalog's IPackage shape
    // (flat pricing fields) rather than the offering-level `pricing` object,
    // so a package can be diffed against its catalog counterpart directly.
    packages: { type: [PackageSchema], default: undefined },

    // Service Levels SLAs
    sla: new Schema(
        {
            deliveryDeadline: new Schema(
                {
                    value: { type: Number },
                    unit: { type: String, enum: ['hours', 'business days', 'calendar days'] },
                },
                { _id: false },
            ),
            availability: {
                type: String,
                enum: ['Best effort', '99%', '99.5%', '99.9%', '99.95%', '99.99%'],
            },
            updateFrequency: {
                type: String,
                enum: [
                    'Real-time / streaming',
                    'Hourly',
                    'Daily',
                    'Weekly',
                    'Monthly',
                    'Quarterly',
                    'On request',
                    'Static (no update)',
                ],
            },
            responseTime: new Schema(
                {
                    value: { type: Number },
                    unit: { type: String, enum: ['ms', 's'] },
                    measurementBasis: { type: String, enum: ['Average', 'p95', 'p99'] },
                },
                { _id: false },
            ),
            availabilityTimeWindow: new Schema(
                {
                    value: { type: String, enum: ['24/7', 'Business hours 5x8', 'Extended 5x12'] },
                    timezone: { type: String },
                },
                { _id: false },
            ),
            // Aligned on ServiceOffering.sla: a numeric retention, while the
            // duration enum moved to `availabilityPeriod`.
            retentionPeriod: { type: Number },
            availabilityPeriod: {
                type: String,
                enum: [
                    'Session only',
                    '30 days',
                    '90 days',
                    '1 year',
                    'Contract duration',
                    'Until consent withdrawal',
                ],
            },
            // Kept for legacy contracts only: the catalog no longer sources it.
            generalAvailabilityDate: { type: Date },
            endOfSupportDate: {
                type: String,
                enum: [
                    '10 days after contract ends',
                    '30 days after contract ends',
                    'Contract duration',
                ],
            },
            endOfLifeDate: {
                type: String,
                enum: [
                    '10 days after contract ends',
                    '30 days after contract ends',
                    'Contract duration',
                ],
            },
            supportChannels: {
                type: [String],
                enum: [
                    'Email',
                    'Phone',
                    'Chat',
                    'Ticketing portal',
                    'Slack',
                    'Community forum',
                    'Dedicated CSM',
                ],
                default: [],
            },
            supportServiceHours: {
                type: String,
                enum: ['24/7', 'Business hours 5x8', 'Extended 5x12'],
            },
            supportSeverityLevel: [
                new Schema(
                    {
                        level: {
                            type: String,
                            enum: ['Critical', 'High', 'Medium', 'Low'],
                        },
                        responseTimeValue: { type: Number },
                        responseTimeUnit: { type: String },
                    },
                    { _id: false },
                ),
            ],
            measurementMonitoringMethod: { type: String },
            note: { type: String },
        },
        { _id: false },
    ),

    // Commitments and Penalties
    commitments: [
        new Schema(
            {
                commitmentConcerned: { type: String },
                triggerOperator: {
                    type: String,
                    enum: ['<', '<=', '>', '>=', '=', 'Outside window', 'Not delivered'],
                },
                triggerValue: { type: String },
                consequenceType: {
                    type: String,
                    enum: [
                        'Service credit',
                        'Discount',
                        'Refund',
                        'Fee waiver',
                        'Suspension',
                        'Termination',
                        'Fixed compensation',
                        'Cure period then escalation',
                    ],
                },
                penaltyAmount: { type: Number },
                penaltyBasis: {
                    type: String,
                    enum: [
                        '% of period fee',
                        '% of total value',
                        'Fixed amount',
                        'Credit days',
                        'Amount per incident',
                    ],
                },
                penaltyCap: {
                    type: String,
                    enum: [
                        '% of monthly fee',
                        '% of annual fee',
                        '% of total value',
                        'Fixed cap',
                        'No cap',
                    ],
                },
                measurementPeriod: {
                    type: String,
                    enum: [
                        'Per incident',
                        'Daily',
                        'Weekly',
                        'Monthly',
                        'Quarterly',
                        'Rolling 30 days',
                        'Rolling 90 days',
                        'Contract duration',
                    ],
                },
                claimProcedure: {
                    type: String,
                    enum: ['Automatic credit', 'Claim required', 'Via ticket'],
                },
                claimDeadlineDays: { type: Number },
                note: { type: String },
            },
            { _id: false },
        ),
    ],

    // Contract Duration
    contractDuration: new Schema(
        {
            value: { type: Number },
            unit: { type: String, enum: ['months', 'years'] },
            renewalMode: {
                type: String,
                enum: ['None (contract ends)', 'Automatic renewal', 'On mutual agreement'],
            },
            noticePeriodDays: { type: Number },
        },
        { _id: false },
    ),

    // Termination for Convenience
    terminationForConvenience: new Schema(
        {
            allowed: { type: Boolean, default: false },
            noticePeriodDays: { type: Number },
        },
        { _id: false },
    ),

    // Termination for Cause
    terminationForCause: new Schema(
        {
            breachThreshold: { type: Number },
            noticePeriod: {
                type: String,
                enum: ['Immediate (no notice)', 'X days notice'],
            },
            noticePeriodDays: { type: Number },
            regulatoryOrSecurityTermination: {
                type: String,
                enum: ['Yes (immediate)', 'Yes (with X days notice)', 'No (case-by-case)'],
            },
            regulatoryNoticeDays: { type: Number },
        },
        { _id: false },
    ),

    // Penalties & Termination Link
    penaltiesTerminationLink: new Schema(
        {
            cumulativePenaltyCapTermination: { type: Boolean, default: false },
            suspensionBeforeTermination: { type: Boolean, default: false },
            suspensionDurationDays: { type: Number },
        },
        { _id: false },
    ),

    // Additional clauses at offering level (same structure as root additionalClauses)
    additionalClauses: { type: AdditionalClausesSchema, default: null },

    // Free-form custom fields for sector-specific data (legal, healthcare, finance, etc.)
    // Sourced from the service offering's customFields and carried over at contract generation.
    customFields: { type: mongoose.Schema.Types.Mixed, default: null },
});


export const ContractSchema: Schema = new Schema(
  {
    uid: String,
    profile: String,
    ecosystem: String,
    orchestrator: String,
    serviceOfferings: [OfferingSchema],
    rolesAndObligations: [{ role: String, policies: [PolicySchema] }],
    serviceChains: { type: [ServiceChainSchema], default: [] },
    purpose: [PurposeSchema],
    members: [MemberSchema],
    revokedMembers: [MemberSchema],
    status: {
      type: String,
      enum: ['signed', 'revoked', 'pending'],
      default: 'pending',
    },
    jsonLD: { type: String },
    useDVCT: { type: Boolean, default: false },
    project: { type: ProjectSchema, default: null },
    additionalClauses: { type: AdditionalClausesSchema, default: null },

    // Free-form custom fields for sector-specific data (legal, healthcare, finance, etc.)
    // Sourced from the ecosystem's customFields and carried over at contract generation.
    customFields: { type: mongoose.Schema.Types.Mixed, default: null },

    // ─── Versioning (declared, not yet wired) ─────────────────────────────
    // Version of this contract within its lineage, used for amendments.
    version: String,

    // Previous and next version of this contract. Both are single references on
    // purpose: a lineage is linear, since an amended version supersedes the
    // previous one. `child: null` therefore identifies the current version.
    parent: { type: Schema.Types.ObjectId, ref: 'Contract', default: null },
    child: { type: Schema.Types.ObjectId, ref: 'Contract', default: null },

    // First contract of the lineage, carried by every version. Lets the whole
    // history be retrieved in a single indexed query rather than by walking
    // parent/child pointers one document at a time.
    rootContract: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
      default: null,
    },

    contractModelVersion: { type: String, default: '1.2.0' },
  },
  {
    timestamps: true,
  },
);

// Retrieve a full lineage ordered by version in one query.
ContractSchema.index({ rootContract: 1, version: 1 });

export default mongoose.model<IContractDB>(
    'Contract',
    ContractSchema,
);
