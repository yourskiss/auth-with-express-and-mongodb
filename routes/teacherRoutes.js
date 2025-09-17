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
    handleChangePassword
} from '../controllers/teacherControllers.js';

// public routes
router.get('/login', renderLogin);
router.post('/login', handleLogin);
router.get('/add', renderAdd);
router.post('/add', handleAdd);
router.get("/update/:id", renderUpdate);
router.post("/update/:id", handleUpdate);
// router.get('/delete/:id', handleDelete);
router.post('/delete/:id', handleDelete);
router.get('/', getAll);
router.get('/detail/:id', getById);
router.get('/logout', handleLogout);


// protected route
router.get('/change-password', isAuthenticated, renderChangePassword);
router.post('/change-password', isAuthenticated, handleChangePassword);
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('teacherDashboard', { userSessionId: req.session.userId });
});
 
 

export const teacherRoutes = router;