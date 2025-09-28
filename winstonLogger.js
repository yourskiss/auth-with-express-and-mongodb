import winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf } = winston.format;

 
 
const logFormat = printf(({ level, message, timestamp, ...info }) => {
  const extra = info[Symbol.for('splat')]?.[0];
  const meta = extra ? `, ${JSON.stringify(extra)}` : '';
  return `${timestamp}, ${level}, ${message}${meta}`;
});

const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

export const wlogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    dailyRotateFileTransport,
  ],
});
 

// Capture client info
export const clientInfo = (req) => {
     return {
        userId: req.session?.user?.id || 'guest',
        role: req.session?.user?.role || 'guest',
        endpoint: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
     }
  };

 