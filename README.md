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

## License

This project is licensed under MIT License
  - see the [LICENSE.md] file for details.