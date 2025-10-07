 
import redisClient from '../config/redisClient.js';

const DASH_CACHE_KEY = `users:dashboard`;
const CACHE_TTL = parseInt(process.env.CACHE_TTL);  

// 📌 Middleware: Cache for /users/detail/:id
export const userDashboardCache = async (req, res, next) => {
  try {
    const cached = await redisClient.get(DASH_CACHE_KEY);
    if (cached) {
      console.log(`✅ Serving from cache  => users/dashboard `);
      return res.send(cached);
    }

    const originalSend = res.send.bind(res);
    res.send = async (body) => {
      try {
        const stringBody = typeof body === 'string' ? body : JSON.stringify(body);
        await redisClient.setex(DASH_CACHE_KEY, CACHE_TTL, stringBody);
        console.log(`📝 Response added in Cache   => users/dashboard`);
      } catch (err) {
        console.error(`Redis error => users/dashboard`, err);
      }
      originalSend(body);
    };
    next();
  } catch (err) {
    console.error(`Redis error  => users/dashboard`, err);
    next();
  }
};



export const clearUserDashboardCache = async () => {
  await redisClient.del(DASH_CACHE_KEY);
  console.log(`🗑️  Cleared cache  => users/dashboard`);
};
