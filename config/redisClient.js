// config/redisClient.js
import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;
const redisPassword = process.env.REDIS_PASSWORD;

const redisClient = new Redis({
    port: redisPort, 
    host: redisHost, 
    password: redisPassword 
});

redisClient.on('connect', () => {
    console.log('✅ Redis client connected successfully!');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
});

export default redisClient;
 