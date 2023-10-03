import dotenv from 'dotenv';

dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || '';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/contrat-dev';
const MONGO_TEST_URL =
  process.env.MONGO_TEST_URL || 'mongodb://127.0.0.1:27017/contract-test-cases';
const SERVER_PORT = process.env.SERVER_PORT ? +process.env.SERVER_PORT : 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'a-secret-unsafe-default-key';
const CONTRAT_MODEL_PATH = process.env.CONTRAT_MODEL_PATH || './';
const BILATERAL_CONTRAT_MODEL_PATH =
  process.env.BILATERAL_CONTRAT_MODEL_PATH || './';
const CATALOG_API_URL = process.env.CATALOG_API_URL || '';
export const config = {
  mongo: {
    url: MONGO_URL,
    testUrl: MONGO_TEST_URL,
    username: MONGO_USERNAME,
    password: MONGO_PASSWORD,
  },
  server: {
    port: SERVER_PORT,
  },
  auth: {
    secret: SECRET_KEY,
  },
  contract: {
    modelPath: CONTRAT_MODEL_PATH,
  },
  bilateralContract: {
    modelPath: BILATERAL_CONTRAT_MODEL_PATH,
  },
  catalog: {
    url: CATALOG_API_URL,
  },
};
