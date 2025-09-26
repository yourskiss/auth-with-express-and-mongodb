import helmet from 'helmet';

const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // disable if you want to customize CSP manually
  crossOriginEmbedderPolicy: false, // useful for some frontend setups
  referrerPolicy: { policy: 'no-referrer' },
  xssFilter: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true
});

export default helmetMiddleware;
