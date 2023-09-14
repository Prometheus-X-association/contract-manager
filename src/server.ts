import { config } from 'config/config';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import contractRoutes from 'routes/contract.routes';
import userRoutes from 'routes/user.routes';
import auth from 'middlewares/auth.middleware';
import pep from 'middlewares/pep.middlewares';
const router = express();

mongoose
  .connect(config.mongo.url, { retryWrites: true })
  .then(() => {
    console.log('MongoDB connected');
    start();
  })
  .catch((e) => {
    console.log(e);
  });

const start = () => {
  // Usefull log
  router.use((req, res, next) => {
    console.log(
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

  // Policy enforcement point
  router.use(pep);
  // Routes
  router.use((req, res, next) => {
    if (req.method === 'POST') {
      if (req.headers['content-type'] !== 'application/json') {
        return res.status(415).send('Content-Type should be application/json');
      }
    }
    next();
  });
  router.use('/user', userRoutes);
  router.use('/contract', auth, contractRoutes);

  // Check route
  router.get('/is-it-alive', (req, res, next) => {
    res.json({ message: 'yes it is!' });
  });

  router.use((req, res, next) => {
    const message = 'Not found!';
    console.log(`404 ${message}`);
    return res.status(404).json({ message });
  });

  http
    .createServer(router)
    .listen(config.server.port, () =>
      console.log(`Server is running on port ${config.server.port}`),
    );
};
