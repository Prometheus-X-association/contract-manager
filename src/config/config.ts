import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const MONGO_USERNAME = process.env.MONGO_USERNAME ?? '';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD ?? '';
const MONGO_URL =
  process.env.MONGO_URL ?? 'mongodb://127.0.0.1:27017/contrat-dev';
const MONGO_TEST_URL =
  process.env.MONGO_TEST_URL ?? 'mongodb://127.0.0.1:27017/contract-test-cases';
const SERVER_PORT = process.env.SERVER_PORT ? +process.env.SERVER_PORT : 3000;
const SECRET_AUTH_KEY =
  process.env.SECRET_AUTH_KEY ?? 'an-unsafe-secret-default-secret-key';
const SECRET_SESSION_KEY =
  process.env.SECRET_SESSION_KEY ?? 'an-unsafe-session-default-secret-key';
const REGISTRY_URL = process.env.CATALOG_REGISTRY_URL ?? '/rules/';
const REGISTRY_FILE_EXT = process.env.CATALOG_REGISTRY_FILE_EXT;
const REGISTRY_DEFINED = !!process.env.CATALOG_REGISTRY_URL;
const SERVER_URL = process.env.SERVER_URL ?? 'http://localhost';
const CATALOG_AUTHORIZATION_KEY =
  process.env.CATALOG_AUTHORIZATION_KEY ?? false;
const USE_CONTRACT_AGENT = process.env.USE_CONTRACT_AGENT === 'true';

export const config = {
  useContractAgent: USE_CONTRACT_AGENT,
  mongo: {
    url: MONGO_URL,
    testUrl: MONGO_TEST_URL,
    username: MONGO_USERNAME,
    password: MONGO_PASSWORD,
  },
  server: {
    port: SERVER_PORT,
    url: SERVER_URL,
  },
  auth: {
    secret: SECRET_AUTH_KEY,
    catalogKey: CATALOG_AUTHORIZATION_KEY,
  },
  session: {
    secret: SECRET_SESSION_KEY,
  },
  contract: {},
  bilateralContract: {},
  catalog: {
    registry: {
      url: REGISTRY_URL,
      fileExt: REGISTRY_FILE_EXT,
      defined: REGISTRY_DEFINED,
    },
  },
};
