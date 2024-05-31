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
4. Start the application: `docker-compose up -d`
5. If you need to rebuild the image `docker-compose build` and restart with: `docker-compose up -d`
6. If you don't want to use the mongodb container from the docker compose you can use the command `docker run -d -p your-port:your-port --name contract-manager contract-manager` after running `docker-compose build`

## Tests

1. Run tests:

  ```bash
  pnpm test
  ```

  This command will run your tests using Mocha. Make sure your tests are
  located in `./src/tests/*.test.ts`.

## License

This project is licensed under MIT License
  - see the [LICENSE.md] file for details.
