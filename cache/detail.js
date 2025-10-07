 
import redisClient from '../config/redisClient.js';
const CACHE_TTL = parseInt(process.env.CACHE_TTL);  

// 📌 Middleware: Cache for /users/detail/:id
export const userDetailCache = async (req, res, next) => {
  const { id } = req.params;
  const DETAIL_CACHE_KEY = `users:detail:${id}`;

  try {
    const cached = await redisClient.get(DETAIL_CACHE_KEY);
    if (cached) {
      console.log(`✅ Serving from cache  => /users/detail/${id} `);
      return res.send(cached);
    }

    const originalSend = res.send.bind(res);
    res.send = async (body) => {
      try {
        const stringBody = typeof body === 'string' ? body : JSON.stringify(body);
        await redisClient.setex(DETAIL_CACHE_KEY, CACHE_TTL, stringBody);
        console.log(`📝 Response added in Cache   => /users/detail/${id}`);
      } catch (err) {
        console.error(`Redis error => users:detail:${id}`, err);
      }
      originalSend(body);
    };
    next();
  } catch (err) {
    console.error(`Redis error  => users:detail:${id}`, err);
    next();
  }
};



export const clearUserDetailCache = async (id) => {
  await redisClient.del(`users:detail:${id}`);
  console.log(`🗑️  Cleared cache  => users:detail:${id} `);
};
