import session from 'express-session';
import MongoStore from 'connect-mongo';

const sessionMiddleware = session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 60 * 60, // 1 hour
  }),
  cookie: {
    maxAge: 60 * 60 * 1000, // 1 hour
    httpOnly: true,
    secure: false, // set to true if using HTTPS
  }
});

export default sessionMiddleware;
