import express from "express";
const app = express();

import { PORT } from "./config/env.js";
import connectDB from "./config/db.js";
import { userRoutes } from "./routes/userRoutes.js";
import { swaggerDocs } from "./config/swagger.js";

import sessionMiddleware from './middlewares/sessionMiddleware.js';
import limiterMiddleware from "./middlewares/rateLimitMiddleware.js";
import corsMiddleware from "./middlewares/corsMiddleware.js";
import helmetMiddleware from './middlewares/helmetMiddleware.js';
import compressionMiddleware from "./middlewares/compressionMiddleware.js";

// make directory accessible for public use
app.use(express.static("public"));

// Connect to Databse
connectDB();

// documentation 
swaggerDocs(app);

// ejs
app.set('view engine', 'ejs');

// allows it to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Middleware - Parse incoming JSON
app.use(express.json());

// Middleware - session
app.use(sessionMiddleware);

// Middleware - compression
app.use(compressionMiddleware);

// Middleware -  limiter
app.use(limiterMiddleware);

// Middleware - cors
app.use(corsMiddleware);

// Middleware - helmet 
app.use(helmetMiddleware);


// get user session value
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

 
 
app.get('/', (req, res) => {
  res.redirect("/users")
});
app.get('/test', (req, res) => {
  res.send('test from Express with Pino!');
});

// user routers
app.use("/users",userRoutes);

// 404 page
app.use((req, res, next) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    message: "Oops! The page you're looking for doesn't exist."
  });
});
 

// run to the server on the port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});