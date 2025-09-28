import express from "express";
const app = express();

import { PORT } from "./config/env.js"; // port
import connectDB from "./config/db.js"; // db
import { userRoutes } from "./routes/userRoutes.js"; // user routes
import { swaggerDocs } from "./config/swagger.js"; //  documentation
import {wlogger, clientInfo } from './winstonLogger.js'; // logger 
import {listLogs, readLogs, downloadLogs} from "./ReadLogs.js"; // read log
import sessionMiddleware from './middlewares/sessionMiddleware.js'; // session
import limiterMiddleware from "./middlewares/rateLimitMiddleware.js"; // limit the request in specifice duration
import corsMiddleware from "./middlewares/corsMiddleware.js"; // cors
import helmetMiddleware from './middlewares/helmetMiddleware.js'; // helment
import compressionMiddleware from "./middlewares/compressionMiddleware.js"; // request response compresor 



// make directory accessible for public use
app.use(express.static("public"));
app.use(express.static('logs'));

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

 
// main route
app.get('/', (req, res) => {
  res.redirect("/users")
});

// user routers
app.use("/users",userRoutes);



app.get('/test', (req, res) => {
    const clientdata = clientInfo(req);
    console.log(clientdata)
    wlogger.info('Started msge here', {  ...clientdata });
    wlogger.warn('warning msge here', {  ...clientdata });
    wlogger.error('err msge here', {  ...clientdata });
  res.send('test from Express with w!');
});
app.use('/logs-list', listLogs);
app.use('/logs-report', readLogs);
app.use('/logs-download', downloadLogs);
 


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