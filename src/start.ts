import { config } from 'config/config';
import mongoose from 'mongoose';
import app from 'server';
import { logger } from 'utils/logger';

logger.info('Starting server...');
app.startServer(config.mongo.url).then((server) => {
  logger.info('Server created.');
  server.listen(process.env.PORT ?? config.server.port, () =>
    logger.info(`Server is running on port ${config.server.port}.`),
  );
  // Create a custom shutdown function
  const gracefulShutdown = async () => {
    logger.info('Shutting down gracefully...');
    try {
      // Close the Express server first
      server.close(() => {
        logger.info('Express server closed.');
        // Close the MongoDB connection
        mongoose.connection.close().then(() => {
          logger.info('MongoDB connection closed.');
          // Terminate the Node.js process gracefully
          process.exit(0);
        });
      });
    } catch (err) {
      logger.error('Error during graceful shutdown:', err);
      // Terminate with an error status code
      process.exit(1);
    }
  };
  // Handle the SIGTERM signal (During shutdown in production)
  process.on('SIGTERM', gracefulShutdown);
  // Handle the SIGINT signal (Using Ctrl+C)
  process.on('SIGINT', gracefulShutdown);
});
