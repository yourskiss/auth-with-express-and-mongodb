import cors from 'cors';

 
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
 
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },  
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Custom-Header'],
  exposedHeaders: ['X-Response-Time', 'X-Powered-By']
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
 