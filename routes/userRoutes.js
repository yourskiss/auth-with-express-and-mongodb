import express from 'express';
const router = express.Router();
import { isGuest, isAuthenticated } from '../middlewares/authMiddleware.js';
import {
    renderAdd, 
    handleAdd,
    renderUpdate, 
    handleUpdate,
    getAll,
    getById,
    handleDelete,
    handleLogout,
    renderChangePassword, 
    handleChangePassword,
    renderDashboard,
} from '../controllers/userController.js';

import { 
    renderRegister,
    handleRegister,
    renderVerifyRegister, 
    handleVerifyRegister,
    renderLogin, 
    handleLogin, 
    renderPasswordForget, 
    handlePasswordForget, 
    renderPasswordOtp, 
    handlePasswordOtp, 
    renderPasswordReset, 
    handlePasswordReset  
} from '../controllers/userGuestController.js';
 

// public routes
router.get('/register', isGuest, renderRegister);
router.post('/register', isGuest, handleRegister);
router.get('/verify-registation', isGuest, renderVerifyRegister);
router.post('/verify-registation', isGuest, handleVerifyRegister);
router.get('/login', isGuest, renderLogin);
router.post('/login', isGuest, handleLogin);
router.get('/password-forget', isGuest, renderPasswordForget);
router.post('/password-forget', isGuest, handlePasswordForget);
router.get('/password-otp', isGuest, renderPasswordOtp);
router.post('/password-otp', isGuest, handlePasswordOtp);
router.get('/password-reset', isGuest, renderPasswordReset);
router.post('/password-reset', isGuest, handlePasswordReset);

// protected route
router.get('/', isAuthenticated, getAll);
router.get('/detail/:id', isAuthenticated, getById);
router.get('/create', isAuthenticated, renderAdd);
router.post('/create', isAuthenticated, handleAdd);
router.get("/update/:id", isAuthenticated, renderUpdate);
router.post("/update/:id", isAuthenticated, handleUpdate);
// router.get('/delete/:id', isAuthenticated, handleDelete);
router.post('/delete/:id', isAuthenticated, handleDelete);
router.get('/logout', isAuthenticated, handleLogout);
router.get('/password-change', isAuthenticated, renderChangePassword);
router.post('/password-change', isAuthenticated, handleChangePassword);
router.get('/dashboard', isAuthenticated, renderDashboard);


export const userRoutes = router;