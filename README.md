# contract-manager

## Prerequisites

Before you begin, ensure you have met the following requirements in local:

- [pnpm](https://pnpm.io/) package manager installed
- [mongodb](https://www.mongodb.com/docs/)

requirements with docker:

- Docker or Docker desktop

### Setup
1. Make sure to fill your .env (see .env.sample):

  ```bash
  cat .env.sample
  ```

2. Copy the .env file

```bash
cp .env.sample .env
```

3. Setup contract-agent.config.json (needed if USE_CONTRACT_AGENT=true in .env)

by default in the sample file the url are set to work with the mongodb provided in the docker compose file.

```bash
cp contract-agent.config.sample.json contract-agent.config.json
```

4. Install project dependencies using pnpm:

  ```bash
  pnpm install
  ```

  This will install all the necessary dependencies for your project.


### Usage for development

1. Watch for changes and automatically restart the server in development:

  ```bash
  pnpm dev
  ```

  This command will use nodemon to watch for changes and
  restart your application when changes are detected.

### Generators

1. Generate TypeScript types for Mongoose using mongoose-tsgen:

  ```bash
  pnpm gen-types
  ```

  This command will generate TypeScript types based on your Mongoose models.

2. Generate Swagger API doc with:

  ```bash
  pnpm gen-swagger
  ```

  This command will generate Swagger documentation,
  accessible at http://localhost:{port}/docs/#/

3. Generate Source Code documentation with:

  ```bash
  pnpm gen-docs
  ```

  This command will generate documentation using TypeDoc for the source code
  and save it in a "docs" folder.
  
## Building the project for production

1. Build the project:

  ```bash
  pnpm build
  ```

  This command will clean the `build/` directory and compile your TypeScript code.

2. Start your Node.js application:

  ```bash
  pnpm start
  ```

  This command will start your application using the compiled code.

## Docker
1. Clone the repository from GitHub: `git clone https://github.com/Prometheus-X-association/contract-manager.git`
2. Navigate to the project directory: `cd contract-manager`
3. Configure the application by setting up the necessary environment variables. You will need to specify database connection details and other relevant settings.
```dotenv
#example
NODE_ENV="development"
MONGO_USERNAME=""
MONGO_PASSWORD=""
MONGO_URL="mongodb://contract-manager-mongodb:27017/contract"
MONGO_TEST_URL="mongodb://contract-manager-mongodb:27017/test-contract"
SERVER_PORT=8888
SECRET_AUTH_KEY="abc123"
SECRET_SESSION_KEY="abc123Session"
CATALOG_REGISTRY_URL="https://registry.visionstrust.com/static/references/rules"
SERVER_BASE_URL=""
CATALOG_REGISTRY_FILE_EXT=""
LOGS_KEY=""
USE_CONTRACT_AGENT =true
CATALOG_AUTHORIZATION_KEY="123" 
```
4. Create a docker network using `docker network create ptx`
5. Start the application: `docker-compose up -d`
6. If you need to rebuild the image `docker-compose build` and restart with: `docker-compose up -d`
7. If you don't want to use the mongodb container from the docker compose you can use the command `docker run -d -p your-port:your-port --name contract-manager contract-manager` after running `docker-compose build`

## Terraform

1. Install Terraform: Ensure Terraform is installed on your machine.
2. Configure Kubernetes: Ensure you have access to your Kubernetes cluster and kubectl is configured.
3. Initialize Terraform: Run the following commands from the terraform directory.
```sh
cd terraform
terraform init
```
4. Apply the Configuration: Apply the Terraform configuration to create the resources.
```sh
terraform apply
```
5. Retrieve Service IP: After applying the configuration, retrieve the service IP.
```sh
terraform output contract_manager_service_ip
```

> * Replace placeholder values in the `kubernetes_secret` resource with actual values from your `.env`.
> * Ensure the `server_port` value matches the port used in your application.
> * Adjust the `host_path` in the `kubernetes_persistent_volume` resource to an appropriate path on your Kubernetes nodes.

### Deployment with Helm

1. **Install Helm**: Ensure Helm is installed on your machine. You can install it following the instructions [here](https://helm.sh/docs/intro/install/).

2. **Package the Helm chart**:
    ```sh
    helm package ./path/to/contract-manager
    ```

3. **Deploy the Helm chart**:
    ```sh
    helm install contract-manager ./path/to/contract-manager
    ```

4. **Verify the deployment**:
    ```sh
    kubectl get all -n contract-manager
    ```

5. **Retrieve Service IP**:
    ```sh
    kubectl get svc -n contract-manager
    ```

> * Replace placeholder values in the `values.yaml` file with actual values from your `.env`.
> * Ensure the `server_port` value matches the port used in your application.
> * Configure your MongoDB connection details in the values.yaml file to point to your managed MongoDB instance.

## Tests

1. Run tests:

  ```bash
  pnpm test
  ```

  This command will run your tests using Mocha, with test files located at `./src/tests/!(*.agent).test.ts`.

## Using the Contract Agent

To enable the Contract Agent, add the following line to your `.env` file:

```
USE_CONTRACT_AGENT=true
```

### Configuring a DataProvider (`contract-agent.config.json`)

The configuration file is a JSON document consisting of sections, where each section describes the configuration for a specific **DataProvider**. Below is a detailed explanation of the available attributes:

- **`source`**: The name of the target collection or table that the DataProvider connects to.
- **`url`**: The base URL of the database host.
- **`dbName`**: The name of the database to be used.
- **`watchChanges`**: A boolean that enables or disables change monitoring for the DataProvider. When enabled, events will be fired upon detecting changes.
- **`hostsProfiles`**: A boolean indicating whether the DataProvider hosts the profiles.
- **`existingDataCheck`**: A boolean that enables the creation of profiles when the module is initialized.

### Example Configuration

Here’s an example of a JSON configuration:

```json
{
  "dataProviderConfig": [
    {
      "source": "contracts",
      "url": "mongodb://contract-manager-mongodb:27017",
      "dbName": "contract"
    },
    {
      "source": "profiles",
      "url": "mongodb://contract-manager-mongodb:27017",
      "dbName": "contract",
      "watchChanges": false,
      "hostsProfiles": true
    }
  ]
}
```

### Contract Agent Tests

#### Prerequisites

- requires a running mongoose server

1. Run tests:

  ```bash
  pnpm test-agent
  ```

or

  ```bash
  docker exec -it contract-manager pnpm test-agent
  ```

  This command will run your tests using Mocha, with test files located at `./src/tests/*.agent.test.ts`.

2. Expected result

![expected result](./docs/images/img.png)

#### example endpoints

> <details><summary>POST /contracts</summary>
>
> First create the contract to create the profile
>
> headers: `{"x-ptx-catalog-key": process.env.CATALOG_AUTHORIZATION_KEY, Content-Type: application/json}`
>
> the x-ptx-catalog-key is needed if you have set up the optional variable CATALOG_AUTHORIZATION_KEY in you .env
> 
> input: 
>```json
>{
>  "role": "ecosystem",
>  "contract": {
>    "ecosystem": "test-ecosystem",
>    "orchestrator": "",
>    "serviceOfferings": [
>      {
>        "participant": "participant-1",
>        "serviceOffering": "allowed-service",
>        "policies": [
>          {
>            "description": "allowed-policy",
>            "permission": [
>              {
>                "action": "read",
>                "target": "http://contract-target/policy",
>                "duty": [],
>                "constraint": []
>              },
>              {
>                "action": "use",
>                "target": "http://contract-target/service",
>                "duty": [],
>                "constraint": []
>              }
>            ],
>            "prohibition": []
>          }
>        ],
>      }
>    ],
>    "purpose": [],
>    "members": [],
>    "revokedMembers": [],
>    "dataProcessings": [],
>  }
>}
>```
> output :
>
>```json
>{
>    "ecosystem": "test-ecosystem",
>    "orchestrator": "",
>    "serviceOfferings": [
>        {
>            "participant": "participant-1",
>            "serviceOffering": "allowed-service",
>            "policies": [
>                {
>                    "description": "allowed-policy",
>                    "permission": [
>                        {
>                            "action": "read",
>                            "target": "http://contract-target/policy",
>                            "duty": [],
>                            "constraint": []
>                        },
>                        {
>                            "action": "use",
>                            "target": "http://contract-target/service",
>                            "duty": [],
>                            "constraint": []
>                        }
>                    ],
>                    "prohibition": []
>                }
>            ],
>            "_id": "67dc5c77a4e381ca892935d7"
>        }
>    ],
>    "rolesAndObligations": [
>        {
>            "role": "ecosystem",
>            "policies": [
>                {
>                    "permission": [],
>                    "prohibition": []
>                }
>            ],
>            "_id": "67dc5ead968a8212c516f18b"
>        }
>    ],
>    "dataProcessings": [],
>    "purpose": [],
>    "members": [],
>    "revokedMembers": [],
>    "status": "pending",
>    "_id": "67dc5c77a4e381ca892935d6",
>    "createdAt": "2025-03-20T18:20:39.850Z",
>    "updatedAt": "2025-03-20T18:20:39.850Z",
>    "__v": 0
>}
>```
> </details>

> <details><summary>POST /negotiation/contract/negotiate</summary>
>
> headers: `{"x-ptx-catalog-key": process.env.CATALOG_AUTHORIZATION_KEY, Content-Type: application/json}`
>
> the x-ptx-catalog-key is needed if you have set up the optional variable CATALOG_AUTHORIZATION_KEY in you .env
> 
> input: 
> ```json
>  {
>     "profileId":  "participant-1",
>     "contractData": {
>       "_id": "67c70ff1e8ccfc4faadc683a",
>       "ecosystem": "test-ecosystem",
>       "@context": "http://www.w3.org/ns/odrl/2/",
>       "@type": "Offer",
>       "serviceOfferings": [
>         {
>           "participant": "test",
>           "serviceOffering": "test-service",
>           "policies": [
>             {
>               "description": "test-policy",
>               "permission": [
>                 {
>                   "action": "use",
>                   "target": "test-target",
>                   "constraint": [],
>                   "duty": []
>                 }
>               ],
>               "prohibition": []
>             }
>           ]
>         }
>       ],
>       "status": "signed"
>     }
>   }
>```
> output :
>
> ```json
> {
>   "canAccept": false,
>   "reason": "Contract contains unacceptable policies or services",
>   "unacceptablePolicies": [
>     "test-policy"
>   ],
>   "unacceptableServices": [
>     "test-service"
>   ]
> }
> ```
>
> </details>

> <details><summary>PUT /negotiation/profile/preferences</summary>
>
> headers: `{"x-ptx-catalog-key": process.env.CATALOG_AUTHORIZATION_KEY, Content-Type: application/json}`
> 
> the x-ptx-catalog-key is needed if you have set up the optional variable CATALOG_AUTHORIZATION_KEY in you .env
>
> input:
>
> ```json
> {
>   "profileId": "participant-1",
>   "preferences": {
>        "policies": [{ "policy": "test-policy", "frequency": 1 }],
>        "services": ["test-service"],
>        "ecosystems": ["test-ecosystem"]
>      }
> }
> ```
>
> output :
>
> ```json
> {
>   "message": "Profile preferences updated successfully."
> }
> ```
>
> </details>

For more information see the [Tests definition](https://github.com/Prometheus-X-association/contract-manager/wiki/Tests-definition).

## Contract exemple

```json
{
  "contract": {
    "@context": "http://www.w3.org/ns/odrl/2/",
    "@type": "Offer",
    "uid": "urn:contract:ecosystem:001",
    "profile": "http://www.w3.org/ns/odrl/2/core",
    "ecosystem": "did:ecosystem:dataspace-health",
    "orchestrator": "did:org:orchestrator",
    "useDVCT": true,
    "status": "pending",
    "permission": [
      {
        "action": "use",
        "target": "http://target/resource"
      }
    ],
    "rolesAndObligations": [
      {
        "role": "dataProvider",
        "policies": [
          {
            "uid": "policy-001",
            "description": "Provider must anonymize data before sharing",
            "permission": [
              {
                "action": "use",
                "target": "http://target/dataset",
                "constraint": [
                  {
                    "@type": "Constraint",
                    "leftOperand": "dateTime",
                    "operator": "lteq",
                    "rightOperand": "2027-12-31"
                  }
                ],
                "duty": [
                  {
                    "action": "compensate",
                    "constraint": [
                      {
                        "leftOperand": "payAmount",
                        "operator": "eq",
                        "rightOperand": "100"
                      }
                    ]
                  }
                ]
              }
            ],
            "prohibition": [
              {
                "action": "distribute",
                "target": "http://target/dataset",
                "constraint": []
              }
            ]
          }
        ]
      }
    ],
    "members": [
      {
        "participant": "did:org:provider",
        "role": "dataProvider",
        "signature": "sig-abc123",
        "date": "2025-06-01T10:00:00.000Z"
      },
      {
        "participant": "did:org:consumer",
        "role": "dataConsumer",
        "signature": "sig-def456",
        "date": "2025-06-02T09:00:00.000Z"
      }
    ],
    "revokedMembers": [],
    "purpose": [
      {
        "uid": "purpose-001",
        "purpose": "Research",
        "action": "use",
        "assigner": "did:org:provider",
        "assignee": "did:org:consumer",
        "purposeCategory": "HealthcareResearch",
        "consentType": "Explicit",
        "piiCategory": "HealthData",
        "primaryPurpose": "true",
        "termination": "2027-12-31",
        "thirdPartyDisclosure": "false",
        "thirdPartyName": ""
      }
    ],
    "serviceChains": [
      {
        "catalogId": "catalog-001",
        "serviceChainId": "chain-001",
        "services": [
          { "serviceId": "svc-A", "order": 1 },
          { "serviceId": "svc-B", "order": 2 }
        ]
      }
    ],
    "serviceOfferings": [
      {
        "participant": "did:org:provider",
        "serviceOffering": "did:offering:premium-data-pack",
        "offerName": "Premium Health Data Pack",
        "offerId": "offer-42",
        "offerCaption": "Anonymized patient dataset for research",
        "policies": [
          {
            "uid": "policy-offering-001",
            "description": "Use restricted to research purposes",
            "permission": [
              {
                "action": "use",
                "target": "did:offering:premium-data-pack",
                "constraint": [
                  {
                    "leftOperand": "purpose",
                    "operator": "eq",
                    "rightOperand": "research"
                  }
                ]
              }
            ],
            "prohibition": []
          }
        ],
        "resources": [
          {
            "resourceName": "Patient Records 2024",
            "resourceId": "res-001",
            "resourceDescription": "Anonymized patient records from 2024",
            "piiInformation": {
              "dataUserRole": "dataProcessor",
              "processingPurposes": ["analytics", "research"],
              "legalBasis": "Legitimate interest",
              "usageRestrictions": ["no-resale", "anonymized-only"],
              "dpoContact": {
                "name": "Alice Dupont",
                "email": "alice.dupont@health-org.fr",
                "phone": "+33600000001"
              },
              "plannedProcessingActivities": ["profiling", "aggregation"],
              "dataCategories": ["health", "demographics"],
              "dataSubjectCategories": ["patients", "adults"],
              "dataVolumeRange": "1000-10000",
              "subProcessorsInvolved": [
                { "name": "CloudCo", "role": "storage", "country": "FR" }
              ],
              "transferOutsideEEA": {
                "hasTransfer": false,
                "countries": [],
                "activities": [],
                "safeguards": []
              },
              "subsequentSubProcessingNoticePeriod": 30,
              "dataSubjectRightsAssistanceDelay": 7,
              "securityBreachAssistanceDelay": "72h",
              "auditNoticePeriod": 14,
              "subsequentControllerReuseAuthorization": {
                "authorized": false,
                "details": "Reuse not authorized without prior written consent"
              },
              "securityMeasures": {
                "encryption": true,
                "pseudonymization": true,
                "accessControl": "RBAC"
              },
              "securityCertificationStandard": ["ISO27001", "ISO27701"],
              "securityCertificationDate": "2024-01-15T00:00:00.000Z",
              "securityCertificationExpiryDate": "2027-01-15T00:00:00.000Z"
            }
          }
        ],
        "pricing": {
          "value": 299.90,
          "billingPeriod": "monthly",
          "setupFee": 500,
          "description": "Monthly subscription – includes 10 000 API calls"
        },
        "sla": {
          "deliveryDeadline": {
            "value": 3,
            "unit": "business days"
          },
          "availability": "99.9%",
          "updateFrequency": "Daily",
          "responseTime": {
            "value": 200,
            "unit": "ms",
            "measurementBasis": "p95"
          },
          "availabilityTimeWindow": {
            "value": "24/7",
            "timezone": "Europe/Paris"
          },
          "retentionPeriod": "1 year",
          "generalAvailabilityDate": "2025-07-01T00:00:00.000Z",
          "endOfSupportDate": "2028-07-01T00:00:00.000Z",
          "endOfLifeDate": "2030-01-01T00:00:00.000Z",
          "supportChannels": ["Email", "Ticketing portal"],
          "supportServiceHours": "Business hours 5x8",
          "supportSeverityLevel": [
            {
              "level": "High",
              "responseTimeValue": 4,
              "responseTimeUnit": "hours"
            }
          ],
          "measurementMonitoringMethod": "Automated monitoring dashboard (Datadog)",
          "note": "SLA reviewed and renegotiated annually"
        },
        "commitments": [
          {
            "commitmentConcerned": "availability",
            "triggerOperator": "<",
            "triggerValue": "99.9%",
            "consequenceType": "Service credit",
            "penaltyAmount": 10,
            "penaltyBasis": "% of period fee",
            "penaltyCap": "% of monthly fee",
            "measurementPeriod": "Monthly",
            "claimProcedure": "Automatic credit",
            "claimDeadlineDays": 30,
            "note": "Credit capped at 30% of the monthly fee"
          }
        ],
        "contractDuration": {
          "value": 12,
          "unit": "months",
          "renewalMode": "Automatic renewal",
          "noticePeriodDays": 30
        },
        "terminationForConvenience": {
          "allowed": true,
          "noticePeriodDays": 60
        },
        "terminationForCause": {
          "breachThreshold": 3,
          "noticePeriod": "X days notice",
          "noticePeriodDays": 15,
          "regulatoryOrSecurityTermination": "Yes (immediate)",
          "regulatoryNoticeDays": 0
        },
        "penaltiesTerminationLink": {
          "cumulativePenaltyCapTermination": true,
          "suspensionBeforeTermination": true,
          "suspensionDurationDays": 30
        },
        "customFields": {
          "legalCode": "L2025-HR-042",
          "sector": "healthcare",
          "internalReference": "PRJ-HEALTH-001"
        }
      }
    ],
    "project": {
      "title": "Cross-Border Health Analytics",
      "caption": "Federated analytics on anonymized patient data",
      "description": "This project aims to leverage anonymized patient records across EU member states to improve early diagnosis models.",
      "categories": ["health", "data-analytics", "AI"],
      "countryOrRegion": "FR",
      "picture": "https://cdn.example.com/projects/health-analytics.png",
      "purpose": "Improve early diagnosis through federated ML models",
      "benefit": "Reduced diagnostic delays and improved patient outcomes",
      "desiredDataAvailabilityDate": "2025-09-01T00:00:00.000Z",
      "legalBasisOfProcessing": "Legitimate interest",
      "legalBasisDescription": "GDPR Art. 6(1)(f) – Legitimate interest for scientific research",
      "dataNeed": [
        {
          "resource": "did:resource:patient-records-2024",
          "description": "Anonymized patient records from 2024 with diagnosis codes"
        }
      ],
      "serviceNeed": [
        {
          "service": "did:service:federated-ml",
          "description": "Federated machine learning inference service"
        }
      ],
      "serviceInfrastructures": [
        {
          "infrastructure": "did:infra:cloud-eu-west",
          "description": "EU-hosted cloud infrastructure compliant with GDPR"
        }
      ],
      "criteriaAndConditions": "All participants must hold ISO 27001 certification. Data must remain within the EU.",
      "contributions": [
        {
          "contribution": "Anonymized dataset",
          "description": "50 000 anonymized patient records from 2022–2024"
        },
        {
          "contribution": "ML model",
          "description": "Pre-trained diagnosis classification model"
        }
      ],
      "participantsAndRoles": [
        {
          "participant": "did:org:provider",
          "roles": ["dataController", "dataProvider"]
        },
        {
          "participant": "did:org:consumer",
          "roles": ["dataProcessor", "modelConsumer"]
        },
        {
          "participant": "did:org:orchestrator",
          "roles": ["orchestrator"]
        }
      ]
    },
    "additionalClauses": {
      "reversibilityExit": {
        "value": "Return + deletion",
        "deadlineDays": 30
      },
      "subcontracting": {
        "subcontractors": ["did:org:cloudco", "did:org:auditfirm"]
      },
      "securityIncidentNotification": {
        "value": "72h"
      },
      "intellectualPropertyOnOutputs": {
        "value": "Joint ownership"
      },
      "governingLawAndJurisdiction": {
        "countryISO": "FR",
        "disputeMode": "Mediation then arbitration"
      },
      "forceMajeure": {
        "value": "Standard + epidemic"
      },
      "auditRight": {
        "value": "Third-party audit",
        "frequency": "Annual"
      },
      "confidentiality": {
        "value": "Mutual NDA",
        "survivalYears": 3
      },
      "amendmentModification": {
        "value": "Written amendment only"
      }
    },
    "customFields": {
      "internalProjectCode": "HEALTH-2025-001",
      "budgetEuros": 250000,
      "approvedBy": "did:person:legal-director",
      "regulatoryFramework": "GDPR + MDR"
    }
  },
  "role": "ecosystem"
}

```

## License

This project is licensed under MIT License
  - see the [LICENSE.md] file for details.