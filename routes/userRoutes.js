import express from 'express';
const router = express.Router();
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import {
    renderAdd, 
    handleAdd,
    renderUpdate, 
    handleUpdate,
    getAll,
    getById,
    handleDelete,
    handleLogout,
    renderLogin, 
    handleLogin, 
    renderChangePassword, 
    handleChangePassword,
    renderDashboard,
} from '../controllers/userController.js';

import { 
    renderPasswordForget, 
    handlePasswordForget, 
    renderPasswordOtp, 
    handlePasswordOtp, 
    renderPasswordReset, 
    handlePasswordReset  
} from '../controllers/userPassword.js';
 

// public routes
router.get('/', getAll);
router.get('/detail/:id', getById);
router.get('/login', renderLogin);
router.post('/login', handleLogin);
router.get('/create', renderAdd);
router.post('/create', handleAdd);
router.get("/update/:id", renderUpdate);
router.post("/update/:id", handleUpdate);
// router.get('/delete/:id', handleDelete);
router.post('/delete/:id', handleDelete);

 

router.get('/password-forget', renderPasswordForget);
router.post('/password-forget', handlePasswordForget);
router.get('/password-otp', renderPasswordOtp);
router.post('/password-otp', handlePasswordOtp);
router.get('/password-reset', renderPasswordReset);
router.post('/password-reset', handlePasswordReset);

 

// protected route
router.get('/logout', isAuthenticated, handleLogout);
router.get('/password-change', isAuthenticated, renderChangePassword);
router.post('/password-change', isAuthenticated, handleChangePassword);
router.get('/dashboard', isAuthenticated, renderDashboard);


export const userRoutes = router;