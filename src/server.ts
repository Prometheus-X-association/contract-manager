import express, { Router } from 'express';
import http from 'http';
import mongoose from 'mongoose';
import contractRoutes from 'routes/contract.routes';
import bilateralContractRoutes from 'routes/bilateral.routes';
import userRoutes from 'routes/user.routes';
import papRoutes from 'routes/pap.routes';
import auth from 'middlewares/auth.middleware';
import pep from 'middlewares/pep.middlewares';
import { logger } from 'utils/logger';
import swaggerUi from 'swagger-ui-express';
import swaggerJson from './swagger.json';
import session from 'express-session';
import { config } from 'config/config';
const router = express();

const startServer = async (url: string) => {
  try {
    await mongoose.connect(url, { retryWrites: true });
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
  //
  // Usefull log
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
    // res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
  });
  // swagger
  router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJson));

  router.use(
    session({
      secret: config.session.secret,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false },
    }),
  );
  // Policy enforcement point
  router.use(pep);
  router.use((req, res, next) => {
    if (req.method === 'POST') {
      if (req.headers['content-type'] !== 'application/json') {
        return res.status(415).send('Content-Type should be application/json');
      }
    }
    next();
  });
  // Routes
  router.use('/', userRoutes);
  router.get('/is-it-alive', (req, res, next) => {
    res.json({ message: 'yes it is!' });
  });
  router.use('/', auth, contractRoutes, bilateralContractRoutes, papRoutes);
  router.use((req, res, next) => {
    const message = 'Not found!';
    logger.info(`404 ${message}`);
    return res.status(404).json({ message });
  });

  return http.createServer(router);
};

export default { router, startServer } as {
  router: Router;
  startServer: (url: string) => Promise<http.Server>;
};
