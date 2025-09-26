import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim().replace(/\/$/, '')) || [];

const corsOptions = {
  origin:allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Custom-Header'],
  exposedHeaders: ['X-Response-Time', 'X-Powered-By']
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
 