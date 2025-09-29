
/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Handle user registration and send OTP to email
 *     tags: [Auth]
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
 *         description: OTP sent to email
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Email or mobile already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/register/verify:
 *   post:
 *     summary: Verify OTP and complete user registration
 *     tags: [Auth]
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
 *         description: Registration successful
 *       400:
 *         description: Invalid OTP or session expired
 *       500:
 *         description: Server error
 */




/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */



/**
 * @swagger
 * /users/password-forget:
 *   post:
 *     summary: Send OTP to user's email for password reset
 *     tags: [Password Reset]
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
 *         description: OTP sent
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Email not found
 *       500:
 *         description: Server error
 */



/**
 * @swagger
 * /users/password-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     tags: [Password Reset]
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
 *         description: OTP verified
 *       400:
 *         description: Invalid OTP or expired
 *       500:
 *         description: Server error
 */



/**
 * @swagger
 * /users/password-reset:
 *   post:
 *     summary: Reset password after OTP verification
 *     tags: [Password Reset]
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
 *         description: Password reset successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Same password as old one
 *       500:
 *         description: Server error
 */







/**
 * @swagger
 * /users/active:
 *   get:
 *     summary: Get list of all active users 
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
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
 *         description: Sort order
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of users returned successfully
 *       409:
 *         description: No record found
 *       500:
 *         description: Internal server error
 */




/**
 * @swagger
 * /users/deactive:
 *   get:
 *     summary: Get list of deactive users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
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
 *         description: Sort order
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of hidden users returned
 *       409:
 *         description: No record found
 *       500:
 *         description: Internal server error
 */





/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination in UI links
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
 *         description: Sort order
 *     responses:
 *       200:
 *         description: User details returned successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */




/**
 * @swagger
 * /users/add:
 *   post:
 *     summary: Create new user
 *     tags: [Users]
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
 *               - role
 *             properties:
 *               fullname:
 *                 type: string
 *               mobile:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User added successfully
 *       409:
 *         description: Email or mobile already exists
 *       500:
 *         description: Internal server error
 */





/**
 * @swagger
 * /users/update/{id}:
 *   get:
 *     summary: User details fetched
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sortBy
 *         type: string
 *       - in: query
 *         name: order
 *         type: string
 *     responses:
 *       200:
 *         description: Render update page
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 * 
 *   post:
 *     summary: Update user details (and optionally profile image)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               mobile:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               img:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation errors
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */





/**
 * @swagger
 * /users/disable/{id}:
 *   post:
 *     summary: Soft-delete (disable) a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       302:
 *         description: Redirect after disabling user
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */





/**
 * @swagger
 * /users/enable/{id}:
 *   post:
 *     summary: Re-enable a disabled user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       302:
 *         description: Redirect after enabling user
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */






/**
 * @swagger
 * /users/delete/{id}:
 *   delete:
 *     summary: Delete a user completely
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       302:
 *         description: Redirect after delete
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */





/**
 * @swagger
 * /users/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - oldpassword
 *               - password
 *               - confirmpassword
 *             properties:
 *               oldpassword:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmpassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation errors
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found
 *       409:
 *         description: Old password incorrect
 *       500:
 *         description: Internal server error
 */



 
 /**
 * @swagger
 * /users/logout:
 *   get:
 *     summary: Logout the currently authenticated user
 *     description: Destroys the user session and clears the session cookie. Redirects to the login page after successful logout.
 *     tags:
 *       - Authentication
 *     responses:
 *       302:
 *         description: Logout successful, user redirected to login page
 *       500:
 *         description: Logout failed due to a server error
 */ 