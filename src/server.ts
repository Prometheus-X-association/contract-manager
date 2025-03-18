import express, { Router } from 'express';
import http from 'http';
import mongoose from 'mongoose';
import contractRoutes from 'routes/contract.routes';
import bilateralContractRoutes from 'routes/bilateral.routes';
import userRoutes from 'routes/user.routes';
import contractsRoutes from 'routes/contracts.routes';
import { logger } from 'utils/logger';
import swaggerUi from 'swagger-ui-express';
import swaggerJson from './swagger/swagger.json';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import { config } from 'config/config';
import path from 'path';
import { ContractAgentService } from 'services/contract.agent.service';
import { NegotiationAgentRouter } from 'contract-agent';

const router = express();
const startServer = async (url: string) => {
  try {
    if (config.useContractAgent) {
      const agent = await ContractAgentService.retrieveService();
      await agent.getMongoosePromise();
    } else {
      await mongoose.connect(url, { retryWrites: true });
    }
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
  router.use((req, res, next) => {
    logger.info(
      `${req.method} : ${req.url}, from: ${req.socket.remoteAddress}`,
    );
    next();
  });
  router.use(express.urlencoded({ extended: true }));
  router.use(express.json());
  router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    next();
  });

  // TODO: This is a temporary solution since the catalog is the only
  // entity that can act on contracts. But a proper layer of authorization
  // should be implemented per participant.
  router.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'development' && req.method !== 'GET' && req.method !== 'OPTIONS') {
      const authKey = req.headers['x-ptx-catalog-key'];
      if (!authKey || authKey !== config.auth.catalogKey) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    }
    next();
  });

  router.use(
    '/rules',
    express.static(path.join(__dirname, '..', 'public/rules')),
  );

  router.get('/todayslog', async (req, res) => {
    if (req.query?.key !== process.env.LOGS_KEY) {
      return res.status(401).send('Unauthorized');
    }

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const logPath = path.join(
      __dirname,
      'logs',
      'all',
      `all_${year}-${month}-${day}.log`,
    );

    const logFile = path.resolve(logPath);
    res.sendFile(logFile);
  });

  router.use('/docs', swaggerUi.serve, (req: any, res: any, next: any) => {
    const baseUrl = `${req.get('host')}`;
    swaggerJson.host = baseUrl;
    swaggerUi.setup(swaggerJson, {
      customCss: '.swagger-ui .models { display: none }',
    })(req, res, next);
  });
  const MemoryStore = createMemoryStore(session);
  router.use(
    session({
      secret: config.session.secret,
      resave: false,
      saveUninitialized: true,
      name: 'contract-manager-session-cookie',
      cookie: { secure: false },
      store: new MemoryStore({
        checkPeriod: 86400000,
      }),
    }),
  );
  router.get('/ping', (req, res, next) => {
    res.json({ message: 'pong!' });
  });
  router.use((req, res, next) => {
    if (req.method === 'POST') {
      if (req.headers['content-type'] !== 'application/json') {
        return res.status(415).send('Content-Type should be application/json');
      }
    }
    next();
  });
  router.use(
    '/',
    userRoutes,
    contractRoutes,
    bilateralContractRoutes,
    contractsRoutes,
    NegotiationAgentRouter,
  );

  router.use((req, res, next) => {
    const message = 'Route not found or incorrect method request!';
    const { method, url } = req;
    logger.info(`404 ${message}`);
    return res.status(404).json({ message, method, url });
  });
  return http.createServer(router);
};
export default { router, startServer } as {
  router: Router;
  startServer: (url: string) => Promise<http.Server>;
};
