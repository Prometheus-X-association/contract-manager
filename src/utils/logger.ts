import * as winston from 'winston';

const format = winston.format.printf(({ message }) => {
  if (typeof message === 'object' && message !== null) {
    return JSON.stringify(message, null, 2);
  }
  return message;
});
// Create a Winston logger with a default console transport.
export const logger = winston.createLogger({
  levels: {
    info: 0,
    error: 1,
  },
  transports: [
    new winston.transports.Console(),
    // Add other transports here.
  ],
  format,
});
