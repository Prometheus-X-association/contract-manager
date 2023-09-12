import dotenv from 'dotenv';

dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME || '';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || '';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
const SERVER_PORT = process.env.SERVER_PORT ? +process.env.SERVER_PORT : 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'a-secret-unsafe-default-key';
const CONTRAT_MODEL_PATH = process.env.CONTRAT_MODEL_PATH || './';
export const config = {
  mongo: {
    url: MONGO_URL,
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
};
