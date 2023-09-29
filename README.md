# contract-manager

## Prerequisites

Before you begin, ensure you have met the following requirements:

- [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) installed
- [pnpm](https://pnpm.io/) package manager installed

- Make sure to fill your .env (see .env.sample):

  ```bash
  cat .env.sample
  ```

- Make sure you have a folder containing your contract models:

  ```bash
  ls ./your_contract_models_folder
  ```
 
## Usage

1. Use the required Node.js version using nvm:

   ```bash
   nvm use
   ```

   On Windows, you can use the following command:

   ```bash
   nvm use $(Get-Content .nvmrc)
   ```

   This ensures that the project uses the specified Node.js version.

2. Install project dependencies using pnpm:

   ```bash
   pnpm install
   ```

   This will install all the necessary dependencies for your project.

3. Make sure to seed the database

   ```bash
   npm run seed
   ```

4. Watch for changes and automatically restart the server in development:

   ```bash
   npm run watch
   ```

   This command will use nodemon to watch for changes and restart your application when changes are detected.
   
5. Generate TypeScript types for Mongoose using mongoose-tsgen:

   ```bash
   npm run gen-types
   ```

   This command will generate TypeScript types based on your Mongoose models.

6. Build the project:

   ```bash
   npm run build
   ```

   This command will clean the `build/` directory and compile your TypeScript code.

7. Start your Node.js application:

   ```bash
   npm start
   ```

   This command will start your application using the compiled code.

8. Run tests:

   ```bash
   npm test
   ```

   This command will run your tests using Mocha. Make sure your tests are located in `./src/tests/**/*.test.ts`.

## License

This project is licensed under ... - see the [LICENSE.md] file for details.
