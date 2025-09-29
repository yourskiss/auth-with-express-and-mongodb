 
import winston from 'winston';
import 'winston-daily-rotate-file';
import { v4 as uuidv4 } from 'uuid';

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
  maxFiles: '2d',
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
  //  new winston.transports.Console(), // show logs in console
    dailyRotateFileTransport, // // only write logs to file
  ],
});
 

// Capture client info
const clientInfo = (req) => {
    req.requestId = uuidv4();
    const sessionID = req.session?.user?.id ? true : false;
    const ua = req.useragent || {};
     return {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
          method: req.method,
          endpoint: req.path, // req.originalUrl,
          query: req.query || {},
        //  params: req.params || {}, 
          userId: req.session?.user?.id || 'guest',
          role: req.session?.user?.role || 'guest',
          isAuthenticated: sessionID,
          device: ua.isMobile ? 'Mobile' : ua.isTablet ? 'Tablet' : 'Desktop',
          platform: ua.platform,
          os: ua.os,
          browser: ua.browser,
          browserVersion: ua.version,
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress, 
        //  userAgent: req.headers['user-agent'] || '',
        //  referer: req.headers['referer'] || '',
        //  origin: req.headers['origin'] || ''
        
     }
  };

 

 const winstonMiddleware = (req, res, next) => {
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

export default winstonMiddleware;
 