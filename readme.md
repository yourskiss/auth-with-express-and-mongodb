<h3>Overview</h3>
<p>
  This web application is built using <strong>Express.js</strong>, <strong>MongoDB Atlas</strong>, and <strong>Mongoose</strong>, following the <strong>MVC (Model-View-Controller)</strong> architecture. It provides a clean and secure interface for managing users with full <strong>CRUD functionality</strong>, robust <strong>authentication</strong>,  <strong>protected routing</strong>, role‑based access control, profile picture upload, and soft deletion of users (activate / deactivate)<br>
  Key features include user registration with email OTP verification, secure login, password reset via OTP, and session-based access control.
</p>
 
<h3>Features</h3>
<ul>
  <li><strong>User Registration</strong> – Register users with OTP verification via email</li>
  <li><strong>Login</strong> – Secure authentication with session management</li>
  <li><strong>Forgot Password</strong> – Reset password via OTP sent to registered email</li>
  <li><strong>OTP Verification</strong> – OTP validation before completing registration or password reset</li>
  <li><strong>Create User</strong> – Add new users to the database</li>
  <li><strong>Edit User</strong> – Update existing user information</li>
  <li><strong>Delete User</strong> – Remove user records from the database</li>
  <li><strong>View All Users</strong> – List all registered users with pagination</li>
  <li><strong>View User by ID</strong> – Display user details using their unique ID</li>
  <li><strong>Protected Routes</strong> – Restrict access to sensitive pages for unauthenticated users</li>
  <li><strong>Pagination</strong> – Navigate user records efficiently with paged views   </li>
</ul>

<h3>Authentication & Security</h3>
<ul>
  <li>Email & Password-based login</li>
  <li>Email OTP verification during registration and password reset</li>
  <li>Session-based access control using <code>req.session</code></li>
  <li>Secure password hashing with <strong>Bcrypt</strong></li>
  <li>Protected routes using custom middleware for authenticated access</li>
  <li>Role‑Based Access Control (`user`, `admin`, `superadmin`)  </li>
 
</ul>

<h3>Tech Stack</h3>
<ul>
  <li><strong>Express.js</strong> – Web framework for backend API and routing</li>
  <li><strong>MongoDB Atlas</strong> – Cloud-hosted NoSQL database</li>
  <li><strong>Mongoose</strong> – ODM for MongoDB with schema validation and models</li>
  <li><strong>EJS</strong> – Templating engine for dynamic HTML rendering</li>
  <li><strong>GitHub</strong> – Version control and project collaboration</li>
  <li><strong>Render.com</strong> – Hosting platform for deploying the live application</li>

  <li><strong>Multer</strong> – Multer for file uploads </li>
  <li><strong>Sharp</strong> – Image processing library that allows you to resize, crop, rotate, convert, and manipulate images.</li>
  <li><strong>Nodemailer</strong> – Used to send OTPs via SMTP email</li>
  <li><strong>deep-email-validator</strong> – Deep validation of email addresses</li>
  <li><strong>Zod</strong> – Type-safe validation for request data</li>
  <li><strong>Bcrypt</strong> – Library for secure password hashing</li>
  <li><strong>Connect-Mongo</strong> – connect-mongo is a session store middleware for Express that stores session data in a MongoDB database.</li>
  <li><strong>express-session</strong> – express-session is a middleware that allows you to create and manage sessions in Express applications</li>
  <li><strong>express-rate-limit</strong> – Protect your app from brute-force attacks or abuse by limiting repeated requests from the same IP over a specified time window. </li>
  <li><strong>Helmet.js</strong> – Helmet is a collection of smaller middleware functions that set secure HTTP headers.</li>
  <li><strong>CORS</strong> – You can allow specific origin, methods, headers, and credentials</li>
  <li><strong>compression</strong> – Middleware enables Gzip (or Brotli) compression in your Express.js app, reducing the size of your HTTP responses</li>
  <li><strong><a href="/api-docs">API Documentation: Swagger</a> -</strong>  Document your API endpoints, Test them interactively in the browser, Auto-generate client/server code, Support authentication and validation</li>
</li>
</ul>
