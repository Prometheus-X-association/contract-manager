# contract-manager

## Prerequisites

Before you begin, ensure you have met the following requirements:

- [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) installed
- [pnpm](https://pnpm.io/) package manager installed

### Setup
1. Make sure to fill your .env (see .env.sample):

  ```bash
  cat .env.sample
  ```

2. Use the required Node.js version using nvm:

  ```bash
  nvm use
  ```

  On Windows, you can use the following command:

  ```bash
  nvm use $(Get-Content .nvmrc)
  ```

  This ensures that the project uses the specified Node.js version.

3. Install project dependencies using pnpm:

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
  accessible at http://localhost:{port}/api-docs/#/

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
1. Clone the repository from GitHub: `git clone https://github.com/prometheus-x/contract-manager.git`
2. Navigate to the project directory: `cd contract-manager`
3. Configure the application by setting up the necessary environment variables. You will need to specify database connection details and other relevant settings.
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
  "source": "profiles",
  "url": "mongodb://localhost:27017",
  "dbName": "contract_consent_agent_db",
  "watchChanges": false,
  "hostsProfiles": true,
  "existingDataCheck": true
}
```

### Contract Agent Tests

1. Run tests:

  ```bash
  pnpm test-agent
  ```

  This command will run your tests using Mocha, with test files located at `./src/tests/*.agent.test.ts`.

## License

This project is licensed under MIT License
  - see the [LICENSE.md] file for details.
