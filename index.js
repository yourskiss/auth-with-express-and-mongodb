import express from "express";
import useragent from 'express-useragent';
const app = express();

import { PORT } from "./config/env.js"; // port
import connectDB from "./config/db.js"; // db
import { userRoutes } from "./routes/userRoutes.js"; // user routes
import { swaggerDocs } from "./config/swagger.js"; //  documentation
import sessionMiddleware from './middlewares/sessionMiddleware.js'; // session
import limiterMiddleware from "./middlewares/rateLimitMiddleware.js"; // limit the request in specifice duration
import corsMiddleware from "./middlewares/corsMiddleware.js"; // cors
import helmetMiddleware from './middlewares/helmetMiddleware.js'; // helment
import compressionMiddleware from "./middlewares/compressionMiddleware.js"; // request response compresor 
import { winstonMiddleware } from "./middlewares/winstonMiddleware.js";  // logger  
import {reportLogs, downloadLogs} from "./ReadLogs.js"; // read logger

// make directory accessible for public use
app.use(express.static("public"));
app.use(express.static('logs'));

// Connect to Databse
connectDB();


// ejs
app.set('view engine', 'ejs');

// Middleware - session
app.use(sessionMiddleware);

// allows it to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Middleware - Parse incoming JSON
app.use(express.json());

// Middleware to parse user-agent
app.use(useragent.express());

// Middleware - compression
app.use(compressionMiddleware);

// Middleware -  limiter
app.use(limiterMiddleware);

// Middleware - cors
app.use(corsMiddleware);

// Middleware - helmet 
app.use(helmetMiddleware);

// documentation 
swaggerDocs(app);

// Attach logger to each request
app.use(winstonMiddleware); 


// get user session value
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});


// test route
 app.get('/test', (req, res) => {
  res.send('test from Express with w!');
});

// main route
app.get('/', (req, res) => {
  res.redirect("/users")
});

// user routers
app.use("/users",userRoutes);




// log reports - router
app.use('/report-logs', reportLogs);
app.use('/download-logs', downloadLogs);
 


// 404 page
// app.use((req, res, next) => {
//   res.status(404).render('404', {
//     title: 'Page Not Found',
//     message: "Oops! The page you're looking for doesn't exist."
//   });
// });

// run to the server on the port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});