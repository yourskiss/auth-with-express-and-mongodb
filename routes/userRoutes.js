import express from 'express';
const router = express.Router();
import { isGuest, isAuthenticated, checkRole } from '../middlewares/authMiddleware.js';
import {  validateObjectId } from '../middlewares/validateObjectId.js';
import uploadPP from '../middlewares/uploadMiddleware.js';
 

import {
    renderAdd, 
    handleAdd,
    renderUpdate, 
    handleUpdate,
    usersList,
    getById,
    handleDisabled,
    handleEnabled,
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

import {usersListCache} from "../cache/list.js";
import {userDetailCache} from "../cache/detail.js";
import {userDashboardCache} from '../cache/dashboard.js';

 
// public routes
router.get('/register', isGuest, renderRegister);
router.post('/register', isGuest, handleRegister);
router.get('/verify-registation', isGuest, renderVerifyRegister);
router.post('/verify-registation', isGuest, handleVerifyRegister);

router.get('/', isGuest, renderLogin);
router.get('/login', isGuest, renderLogin);
router.post('/login', isGuest, handleLogin);
 
router.get('/password-forget', isGuest, renderPasswordForget);
router.post('/password-forget', isGuest, handlePasswordForget);
router.get('/password-otp', isGuest, renderPasswordOtp);
router.post('/password-otp', isGuest, handlePasswordOtp);
router.get('/password-reset', isGuest, renderPasswordReset);
router.post('/password-reset', isGuest, handlePasswordReset);


// protected route
router.get('/create', isAuthenticated, checkRole(['admin', 'superadmin']), renderAdd);
router.post('/create', isAuthenticated, checkRole(['admin', 'superadmin']), handleAdd);

router.get('/list', usersListCache, isAuthenticated, checkRole(['admin', 'superadmin']), usersList);
router.get('/detail/:id', userDetailCache, isAuthenticated, checkRole(['admin', 'superadmin']), validateObjectId, getById);

router.get('/disabled/:id', isAuthenticated, checkRole(['admin','superadmin']), validateObjectId, handleDisabled);
router.get('/enabled/:id', isAuthenticated, checkRole(['admin','superadmin']), validateObjectId, handleEnabled);
router.get('/delete/:id', isAuthenticated, checkRole(['admin','superadmin']), validateObjectId, handleDelete);

router.get("/update/:id", isAuthenticated, checkRole(['user', 'admin', 'superadmin']), validateObjectId, renderUpdate);
router.post("/update/:id", isAuthenticated, checkRole(['user', 'admin', 'superadmin']), uploadPP.single('profilepicture'), validateObjectId, handleUpdate);

router.get('/logout', isAuthenticated, checkRole(['user', 'admin', 'superadmin']), handleLogout);

router.get('/password-change', isAuthenticated, checkRole(['user', 'admin', 'superadmin']), renderChangePassword);
router.post('/password-change', isAuthenticated, checkRole(['user', 'admin', 'superadmin']), handleChangePassword);

// router.get('/dashboard', userDashboardCache, isAuthenticated, checkRole(['user', 'admin', 'superadmin']), renderDashboard);
router.get('/dashboard', isAuthenticated, checkRole(['user', 'admin', 'superadmin']), renderDashboard);


const userRoutes = router;
export default userRoutes;