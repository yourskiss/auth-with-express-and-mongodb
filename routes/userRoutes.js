import express from 'express';
const router = express.Router();
import { isGuest, isAuthenticated, checkRole } from '../middlewares/authMiddleware.js';
import {
    renderAdd, 
    handleAdd,
    renderUpdate, 
    handleUpdate,
    getAll,
    getById,
    handleDelete,
    handleDeletePost,
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
router.get('/', isAuthenticated, checkRole(['admin', 'superadmin']), getAll);
router.get('/detail/:id', isAuthenticated, checkRole(['admin', 'superadmin']), getById);
router.get('/create', isAuthenticated, checkRole(['admin', 'superadmin']), renderAdd);
router.post('/create', isAuthenticated, checkRole(['admin', 'superadmin']), handleAdd);
router.get('/delete/:id', isAuthenticated, checkRole(['admin','superadmin']), handleDelete);
router.post('/delete/:id', isAuthenticated, checkRole(['admin','superadmin']), handleDeletePost);
router.get("/update/:id", checkRole(['user', 'admin', 'superadmin']), renderUpdate);
router.post("/update/:id", checkRole(['user', 'admin', 'superadmin']), handleUpdate);
router.get('/logout', isAuthenticated, checkRole(['user', 'admin', 'superadmin']),  handleLogout);
router.get('/password-change', isAuthenticated, checkRole(['user', 'admin', 'superadmin']), renderChangePassword);
router.post('/password-change', isAuthenticated, checkRole(['user', 'admin', 'superadmin']), handleChangePassword);
router.get('/dashboard', isAuthenticated, checkRole(['user', 'admin', 'superadmin']), renderDashboard);


export const userRoutes = router;