// utils/log.js

export const wlogs = (req, level, message, status) => {
  console.log("session in log", req.session?.user)
  if (!req.logger || typeof req.logger[level] !== 'function') {
    console.warn('Logger not available or invalid log level:', level);
    return;
  }
  req.logger[level](message, { status });
};
