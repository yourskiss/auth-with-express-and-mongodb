 
import redisClient from '../config/redisClient.js';
 const CACHE_TTL = parseInt(process.env.CACHE_TTL);  

// 📌 Middleware: Cache for /users/list
export const usersListCache = async (req, res, next) => {
  const {role, page, sortBy, order } = req.query;
  const LIST_CACHE_KEY = `users:list:role=${role}:page=${page}:sortBy=${sortBy}:order=${order}`;

  try {
    const cached = await redisClient.get(LIST_CACHE_KEY);
    if (cached) {
      console.log(`✅ Serving from cache => ${LIST_CACHE_KEY}`);
      return res.send(cached);
    }

    const originalSend = res.send.bind(res);
    res.send = async (body) => {
      try {
        const stringBody = typeof body === 'string' ? body : JSON.stringify(body);
        await redisClient.setex(LIST_CACHE_KEY, CACHE_TTL, stringBody);
        console.log(`📝 Response added in Cache  => ${LIST_CACHE_KEY}`);
      } catch (err) {
        console.error(`Redis error =>${LIST_CACHE_KEY}`, err);
      }
      originalSend(body);
    };
    next();
  } catch (err) {
    console.error(`Redis error => ${LIST_CACHE_KEY}`, err);
    next();
  }
};
 

// ❌ Clear cache functions
export const clearUsersListCache = async ({ role, page, sortBy, order }) => {
  const LIST_CACHE_KEY = `users:list:role=${role}:page=${page}:sortBy=${sortBy}:order=${order}`;
  await redisClient.del(LIST_CACHE_KEY);
  console.log(`🗑️  Cleared cache => ${LIST_CACHE_KEY}`);
};


export const clearAllUsersListCache = async () => {
  const pattern = `users:list:*`;
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(...keys);
    console.log(`🗑️  Cleared cache => ${pattern} (${keys.length})`);
  } else {
    console.log(`ℹ️ No ${pattern} cache keys found`);
  }
};