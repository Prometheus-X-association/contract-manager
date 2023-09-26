import * as winston from 'winston';
// Add custom colors
winston.addColors({
  error: 'red',
  warn: 'cyan',
  info: 'white',
});

const format = winston.format.printf(
  ({ timestamp, level, message, ...meta }) => {
    if (meta !== null && Object.keys(meta).length > 0) {
      return `${message}\n${JSON.stringify(meta, null, 2)}`;
    }
    return message;
  },
);

// Create a Winston logger with custom colors and a default console transport.
export const logger = winston.createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
  },
  format,
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        format,
      ),
    }),
    // Add other transports here.
  ],
});
