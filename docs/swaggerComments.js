/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         fullname:
 *           type: string
 *         email:
 *           type: string
 *         mobile:
 *           type: string
 *         role:
 *           type: string
 *         profilepicture:
 *           type: string
 *           nullable: true
 *         isDeleted:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *         error:
 *           type: string
 */

/**
 * @swagger
 * /users/logout:
 *   get:
 *     summary: Logout the currently logged-in user (destroy session)
 *     tags:
 *       - Users
 *     responses:
 *       302:
 *         description: Redirect to login page after logout
 *       500:
 *         description: Internal server error during logout
 */

/**
 * @swagger
 * /users/list:
 *   get:
 *     summary: Get a paginated list of users
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter users by role
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: List of users returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 sortBy:
 *                   type: string
 *                 order:
 *                   type: string
 *                 role:
 *                   type: string
 *                 countrecord:
 *                   type: integer
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Role filter context
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: User detail returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       409:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/update/{id}:
 *   get:
 *     summary: Render user data for update view
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Successfully fetched user for update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *                 querydata:
 *                   type: object
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/update/{id}:
 *   post:
 *     summary: Update user profile (with optional profile image)
 *     tags:
 *       - Users
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: formData
 *         name: fullname
 *         required: true
 *         type: string
 *       - in: formData
 *         name: email
 *         required: true
 *         type: string
 *       - in: formData
 *         name: mobile
 *         required: true
 *         type: string
 *       - in: formData
 *         name: role
 *         required: true
 *         type: string
 *       - in: formData
 *         name: profilepicture
 *         required: false
 *         type: file
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *       409:
 *         description: Update not applied
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/disable/{id}:
 *   post:
 *     summary: Soft delete (disable) a user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to user list after disabling
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/enable/{id}:
 *   post:
 *     summary: Re-enable (activate) a disabled user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to user list after enabling
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/delete/{id}:
 *   post:
 *     summary: Permanently delete a user
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect to updated user list
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /users/add:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: formData
 *         name: fullname
 *         type: string
 *         required: true
 *       - in: formData
 *         name: mobile
 *         type: string
 *         required: true
 *       - in: formData
 *         name: email
 *         type: string
 *         required: true
 *       - in: formData
 *         name: password
 *         type: string
 *         required: true
 *       - in: formData
 *         name: role
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate user or creation failed
 *       500:
 *         description: Internal server error
 */

 
/**
 * @swagger
 * /users/change-password:
 *   post:
 *     summary: Change the current user's password
 *     tags:
 *       - Users
 *     parameters:
 *       - in: formData
 *         name: oldpassword
 *         type: string
 *         required: true
 *       - in: formData
 *         name: password
 *         type: string
 *         required: true
 *       - in: formData
 *         name: confirmpassword
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       409:
 *         description: Incorrect old password or update failed
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/dashboard:
 *   get:
 *     summary: Render user dashboard
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Dashboard data for the current user
 *       409:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

 

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Handle user registration (send OTP)
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - mobile
 *               - email
 *               - password
 *               - confirmpassword
 *             properties:
 *               fullname:
 *                 type: string
 *               mobile:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmpassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent and registration session started
 *       400:
 *         description: Validation error (invalid input)
 *       409:
 *         description: Email or mobile already registered
 *       500:
 *         description: Internal server error
 */
 

/**
 * @swagger
 * /auth/verify-register:
 *   post:
 *     summary: Verify OTP and complete registration
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       201:
 *         description: OTP verified, user registered
 *       400:
 *         description: Validation error or OTP expired/invalid
 *       404:
 *         description: Registration failed (e.g. user not found)
 *       500:
 *         description: Internal server error
 */

 

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and create session
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, session created
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found or invalid credentials
 *       500:
 *         description: Internal server error
 */
 

/**
 * @swagger
 * /auth/password-forget:
 *   post:
 *     summary: Initiate password recovery by sending OTP
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent for password recovery
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email not found in system
 *       500:
 *         description: Internal server error
 */
 

/**
 * @swagger
 * /auth/password-otp:
 *   post:
 *     summary: Verify OTP for password recovery
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified, proceed to reset password
 *       400:
 *         description: Validation error or OTP expired/invalid
 *       422:
 *         description: Invalid OTP or session issue
 *       500:
 *         description: Internal server error
 */
 

/**
 * @swagger
 * /auth/password-reset:
 *   post:
 *     summary: Reset the user's password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmpassword
 *             properties:
 *               password:
 *                 type: string
 *               confirmpassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Validation error
 *       409:
 *         description: Password same as previous or reset not found
 *       500:
 *         description: Internal server error
 */
