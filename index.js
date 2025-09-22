import express from "express";
const app = express();
import session from 'express-session';
import MongoStore from 'connect-mongo';


import { PORT } from "./config/env.js";
import connectDB from "./config/db.js";
import { userRoutes } from "./routes/userRoutes.js";

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

 
// Connect to Databse
connectDB();

// genrate session
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 60 * 60, 
  }),
  cookie: {
    maxAge: 60 * 60 * 1000, 
    httpOnly: true,  
    secure: false  
  }
}));


 
// ejs
app.set('view engine', 'ejs');

// allows it to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Middleware - Parse incoming JSON
app.use(express.json());

// make public folder accessible for public use
app.use(express.static("public"));

// serve static uploads
// app.use('/userprofile', express.static(path.join(__dirname, 'public/userprofile')));


// get user session value
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.get("/", (req, res) => {
  // res.send("hello");
  res.redirect('/users/login');
});


app.use("/users",userRoutes);


// run to the server on the port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});