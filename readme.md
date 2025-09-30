<h3>🧾 Project Overview</h3>
<p>
This web application is a secure and scalable user management system built with Express.js, MongoDB Atlas, and Mongoose, following the MVC (Model-View-Controller) architecture. It features robust authentication, role-based access control, session management, and user-friendly CRUD operations.
<br />
The app is designed with a focus on security, maintainability, and user experience. It includes critical functionality like email-based OTP verification, password reset, image upload and processing, and soft deletion (activate/deactivate users).
</p>
 
<h3>Authentication & Security</h3>
<ul>
<li>Session-Based Authentication using express-session and connect-mongo</li>
<li>Email + Password Login with Bcrypt password hashing</li>
<li>Email OTP Verification for both registration and password reset</li>
<li>Secure Routing with custom middleware to protect sensitive endpoints</li>
<li>Role-Based Access Control (RBAC): user, admin, superadmin</li>
<li>Rate Limiting using express-rate-limit to prevent brute-force attacks</li>
<li>Secure HTTP Headers using Helmet.js</li>
<li>CORS Configuration for safe cross-origin access</li>
<li>Session Data Stored in MongoDB via connect-mongo</li>
</ul>

<h3>👤 User Management Features</h3>
<ul>
<li>Register User with email OTP verification</li>
<li>Login with secure session handling</li>
<li>Forgot Password flow with OTP via email</li>
<li>OTP Verification before completing registration or password reset</li>
<li>Create User (Admin functionality)</li>
<li>Edit User profile details</li>
<li>Delete and Soft Delete (activation/deactivation toggle)</li>
<li>View All Users with pagination, sortBy, OrderBy</li>
<li>View User by ID with detailed information</li>
<li>Profile Picture Upload with resizing using Multer and Sharp</li>
</ul>

<h3>📄 API & Documentation - <a href="https://session-auth-express-mongo.onrender.com/api-docs/" target="blank">Swagger</a></h3>
<ul>
<li>Interactive API documentation</li>
<li>Auto-generated client/server SDKs</li>
<li>Supports authentication headers</li>
<li>Validates request/response schemas</li>
</ul>


<h3>🔎 Logging & Monitoring - <strong>Winston Logger</strong></h3>
<ul>
<li>Structured logging with log-levels</li>
<li>View logs by severity and date</li>
<li>Download logs for auditing in .csv format</li>
</ul>
 
<h3>📘 Architecture: MVC Pattern</h3>
<ul>
<li><strong>Model:</strong> Mongoose schemas (User, OTP, etc.)</li>
<li><strong>View:</strong> EJS templates for rendering UI</li>
<li><strong>Controller:</strong> Express route handlers with logic for auth, user management, etc.</li>
</ul>




<h2>🧰 Tech Stack</h2>
<h3>📦 Backend</h3>
<ul>
<li><strong>Express.js</strong> – Node.js web framework</li>
<li><strong>MongoDB Atlas</strong> – Scalable cloud-hosted NoSQL database</li>
<li><strong>Mongoose</strong> – ODM for schema and data modeling</li>
<li><strong>EJS</strong> – Templating engine for server-rendered views</li>
</ul>

<h3>📑 Validation</h3>
<ul>
<li><strong>Zod</strong> – Type-safe schema validation for incoming data</li>
<li><strong>deep-email-validator</strong> – Deep email validation for real addresses</li>
</ul>

<h3>🔐 Security & Auth</h3>
<ul>
<li><strong>Bcrypt</strong> – Password hashing</li>
<li><strong>express-session</strong> – Session management middleware</li>
<li><strong>connect-mongo</strong> – Stores session data in MongoDB</li>
<li><strong>express-rate-limit</strong> – Request throttling to prevent abuse</li>
<li><strong>Helmet</strong> – Sets secure HTTP headers</li>
<li><strong>CORS</strong> – Configurable cross-origin requests</li>
</ul>

<h3>📧 Email & OTP</h3>
<ul>
<li><strong>Nodemailer</strong> – SMTP-based email sending (e.g., for OTPs)
<li><strong>Twilio</strong> –  SMS Notification on success registation/password changed/forget password. (trial account - self only)</h3>
</ul>

<h3>📁 File Upload & Image Processing</h3>
<ul>
<li><strong>Multer</strong> – Handles file uploads (e.g., profile pictures)</li>
<li><strong>Sharp</strong> – Image resizing, compression, format conversion</li>
</ul>

<h3>📦 Performance</h3>
<ul>
<li><strong>compression</strong> – Enables Gzip/Brotli compression for faster load times</li>
</ul>


<h3>⚙️ Deployment Tools</h3>
<ul>
<li><strong>GitHub</strong> – Version control and team collaboration</li>
<li><strong>Render.com</strong> – Cloud hosting platform for Node.js applications</li>
<li><strong>MongoDB Atlas</strong> – Managed NoSQL DB with high availability</li>
</ul>



<h3>🛡️ Future-Proofing</h3>
<p>This application is designed for extensibility. Potential future integrations:</p>
<ul>
<li>JWT-based API authentication (compatible)</li>
<li>Audit logs</li>
<li>Multi-factor authentication</li>
<li>Email templates via MJML or SendGrid</li>
</ul>