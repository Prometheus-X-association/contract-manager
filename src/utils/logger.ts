import * as winston from 'winston';
import { TransformableInfo } from 'logform';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
// Add custom colors
winston.addColors({
  error: 'red',
  warn: 'cyan',
  info: 'white',
});
winston.addColors({
  meta: 'italic gray',
});
const colorizer = winston.format.colorize();
const format = winston.format.printf((info: TransformableInfo) => {
  const msg = info.message?.toString() ?? '';
  const meta: Record<string, unknown> = {};

  Object.entries(info).forEach(([key, value]) => {
    if (!['timestamp', 'level', 'message'].includes(key)) {
      meta[key] = value;
    }
  });

  if (Object.keys(meta).length > 0) {
    return `${msg}${colorizer.colorize(
      'meta',
      `\n${JSON.stringify(meta, null, 2)}`,
    )}`;
  }
  return msg;
});

const customFormat = (level: string) => {
  return winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
    winston.format.json(),
  );
};

const dailyTransportOptions = (level: string) => {
  return {
    filename: path.join(__dirname, `../logs/${level}/${level}_%DATE%.log`),
    format: customFormat(level),
    level: level,
    maxFiles: '14d',
    maxSize: '20m',
  } as DailyRotateFile.DailyRotateFileTransportOptions;
};

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
    new DailyRotateFile({
      ...dailyTransportOptions('error'),
    }),
    new DailyRotateFile({
      maxFiles: '14d',
      maxSize: '20m',
      filename: path.join(__dirname, '../logs/all/all_%DATE%.log'),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
      ),
      level: 'info',
    }),
  ],
});
