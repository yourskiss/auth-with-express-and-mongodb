import express from "express";
const app = express();
import session from 'express-session';

import { PORT } from "./config/env.js";
import connectDB from "./config/db.js";
import { userRoutes } from "./routes/userRoutes.js";

// Connect to Databse
connectDB();

// genrate session
app.use(session({
  secret: process.env.SECRET_KEY,  
  resave: false,
  saveUninitialized: false
}));

// make public folder accessible for public use
app.use(express.static("public"));

// ejs
app.set('view engine', 'ejs');

// allows it to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Middleware - Parse incoming JSON
app.use(express.json());



// get user session id value
app.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;
  next();
});

app.get("/", (req, res) => {
  // res.send("Hello World");
  res.redirect('/users/login');
});


app.use("/users",userRoutes);


// run to the server on the port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});