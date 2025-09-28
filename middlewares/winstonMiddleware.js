 
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

const logger = winston.createLogger({
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
const clientInfo = (req) => {
//  console.log("session in clientInfo", req.session?.user)
     return {
        endpoint: req.originalUrl,
        method: req.method,
        userId: req.session?.user?.id || 'guest',
        role: req.session?.user?.role || 'guest',
        timestamp: new Date().toISOString(),
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
     }
  };

 

export const winstonMiddleware = (req, res, next) => {
  const clientdata = clientInfo(req);
 // console.log("session in winstonMiddleware", req.session?.user)
  req.logger = {
    info: (msg, meta = {}) => logger.info(msg, { ...clientdata, ...meta }),
    error: (msg, meta = {}) => logger.error(msg, { ...clientdata, ...meta }),
    warn: (msg, meta = {}) => logger.warn(msg, { ...clientdata, ...meta }),
    debug: (msg, meta = {}) => logger.debug(msg, { ...clientdata, ...meta }),
  };

  next();
};


 