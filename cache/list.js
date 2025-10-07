 
import redisClient from '../config/redisClient.js';
 const CACHE_TTL = parseInt(process.env.CACHE_TTL);  

// 📌 Middleware: Cache for /users/list
export const usersListCache = async (req, res, next) => {
  
  const queryKey = JSON.stringify(req.query);
  const LIST_CACHE_KEY = `users:list:${queryKey}`;

  try {
    const cached = await redisClient.get(LIST_CACHE_KEY);
    if (cached) {
      console.log('✅ Serving from cache => /users/list');
      return res.send(cached);
    }

    const originalSend = res.send.bind(res);
    res.send = async (body) => {
      try {
        const stringBody = typeof body === 'string' ? body : JSON.stringify(body);
        await redisClient.setex(LIST_CACHE_KEY, CACHE_TTL, stringBody);
        console.log('📝 Response added in Cache  => /users/list');
      } catch (err) {
        console.error('Redis error => users:list -', err);
      }
      originalSend(body);
    };
    next();
  } catch (err) {
    console.error('Redis error => users:list -', err);
    next();
  }
};
 

// ❌ Clear cache functions
export const clearUsersListCache = async (req) => {
  const queryKey = JSON.stringify(req.query);
  const LIST_CACHE_KEY = `users:list:${queryKey}`;

  await redisClient.del(LIST_CACHE_KEY);
  console.log('🗑️  Cleared cache => users:list');
};

 