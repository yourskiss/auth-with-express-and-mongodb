import mongoose from "mongoose";
import userModels from "../models/userModels.js";
import { hashedPassword, comparePassword } from '../utils/password.js';


export const handleLogout = async (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Logout failed');
    }
    res.clearCookie('connect.sid'); // Optional: clears the session cookie
    res.redirect('/users/login'); // Redirect to login page
  });
};


 
export const getAll = async (req, res) => {
  const usersession = req.session.user;
  const page = parseInt(req.query.page) || 1; // current page number
  const limit = process.env.RECORD_LIMIT; 
  const skip = (page - 1) * limit;
  
  const sortBy = req.query.sortBy || 'createdAt'; // default field
  const order = req.query.order === 'desc' ? -1 : 1; // default A-Z
  const sortOptions = {};
  sortOptions[sortBy] = order;

  let query = {};
  if (usersession.role === 'admin') {
    query = { role: { $nin: ['superadmin', 'admin'] } };
  }
  if (usersession.role === 'superadmin') {
    query = { role: { $nin: ['superadmin', 'user'] } };
  }
  try {
    const totalCount = await userModels.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    
    const result = await userModels.find(query).collation({ locale: 'en', strength: 1 }).sort(sortOptions).skip(skip).limit(limit);
    if (!result || result.length === 0) {
      return res.status(409).render("userview/list", {
        error: "No User found",
        result: [],
        currentPage: 1,
        totalPages: 1,
        sortBy,
        order
      });
    }
    res.render("userview/list", {
      error: null,
      result,
      currentPage: page,
      totalPages,
      sortBy,
      order
    });
  } catch (error) {
    console.error("Error fetching User:", error.message);
    res.status(500).render("userview/list", {
      error: "Internal Server Error",
      result: [],
      currentPage: 1,
      totalPages: 1,
      sortBy,
      order
    });
  }
};


export const getById = async (req, res) => {
  const { id } = req.params;
  const { page, sortBy, order } = req.query;
  const querydata = `?page=${page}&sortBy=${sortBy}&order=${order}`;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).render('userview/detail', { 
        error: 'Invalid User id', 
        result: '', 
        querydata 
    });
  }
  try {
    const result = await userModels.findById(id);
    if (!result) {
      return res.status(404).render('userview/detail', { 
        error: 'User not found', 
        result: '', 
        querydata 
      });
    } 
    console.log("User by id - ",result);
    res.render("userview/detail", { 
      error:null, 
      result:result, 
      querydata 
    });
  } catch (error) {
    console.error('Error fetching User by id:', error.message);
    res.status(500).render('userview/detail', { 
      error: 'Internal Server Error', 
      result: '', 
      querydata 
    });
  }
};

export const renderAdd = async (req, res) => {
  const data = {fullname: '', mobile: '', email: ''}
  res.render('userview/create', { 
    success:null, 
    error: null, 
    data 
  });
}
export const handleAdd = async (req, res) => {
  const { fullname, mobile, email, password, role } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  const data = {fullname, mobile, email, password, role}
  if (!fullname || !mobile || !email || !password || !role) {
    return res.status(401).render('userview/create', {
          success:null,
          error: 'All fields are required.',
          data
        });
  }
  if (!mobileRegex.test(mobile)) {
    return res.status(401).render('userview/create', {
          success:null,
          error: 'Mobile number must be exactly 10 digits.',
          data
        });
  }
  if (!emailRegex.test(email)) {
    return res.status(401).render('userview/create', {
          success:null,
          error: 'Email format is invalid.',
          data
        });
  }
  if (!passwordRegex.test(password)) {
    return res.status(401).render('userview/create', {
      success:null,
      error: 'Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.',
      data
    });
  }
  try {
    const hashedWithSaltPassword = await hashedPassword(password)
    const ud = { fullname, mobile, email, password:hashedWithSaltPassword, role, otpTemp:null, otpExpiry:null  }
    const result = await userModels.create(ud);
    console.log("New User created: ", result);
    return res.status(200).render('userview/create', {
          success:'User added successfully.',
          error: null,
          data
        });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).render('userview/create', {
          success:null,
          error: `${field} already exists.`,
          data
        });
    }
    return res.status(500).render('userview/create', {
          success:null,
          error: 'Internal Server Error. Please try again later.',
          data
        });
  }
};

 
export const renderUpdate = async (req, res) => {
  const { id } = req.params;
  const { page, sortBy, order } = req.query;
  const qd = { page, sortBy, order }
 // console.log(qd, "get - ", page, sortBy, order);
 
  const datablank = { fullname:'', email:'', mobile:'', role:'' };
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).render("userview/update", { 
        success:null, 
        error:'Invalid User id', 
        id, 
        result:datablank, 
        querydata:qd
      });
  }
  try {
    const result = await userModels.findById(id);
    if (!result) {
      return res.status(404).render("userview/update", { 
          success:null, 
          error: 'User not found', 
          id, 
          result:datablank, 
          querydata:qd
        });
    } 
    return res.status(200).render("userview/update", { 
        success:null, 
        error: null, 
        id, 
        result:result, 
        querydata:qd
      });
  } catch (err) {
   return res.status(500).render("userview/update", { 
      success:null, 
      error: 'Internal Server Error', 
      id, 
      result:datablank, 
      querydata:qd
    });
  }
};
export const handleUpdate = async (req, res) => {
  const { page, sortBy, order, fullname, email, mobile, role } = req.body;
  const { id } = req.params;
  const data = { fullname, email, mobile, role };
  const qd = { page, sortBy, order }
 
  const mobileRegex = /^[6-9]\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!fullname || !email || !mobile) {
    return res.status(400).render("userview/update", { 
      success:null, 
      error: 'All fields are required', 
      id, 
      result:data, 
      querydata:qd
    });
  }
  if (!mobileRegex.test(mobile)) {
    return res.status(400).render("userview/update", { 
      success:null, 
      error: 'Invalid mobile number', 
      id, 
      result:data, 
      querydata:qd
    });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).render("userview/update", { 
      success:null, 
      error: 'Invalid email format', 
      id, 
      result:data, 
      querydata:qd 
    });
  }
  try {

    const newdata = {...data, otpTemp:null, otpExpiry:null }
    const updated = await userModels.findByIdAndUpdate(
      id,
      newdata,
      { new: true, runValidators: true }
    );
    if (!updated)  {
      return res.status(409).render("userview/update", { 
        success:null, 
        error: 'User not Updated', 
        id, 
        result:data, 
        querydata:qd 
      });
    }
      return res.status(200).render("userview/update", { 
        success:'User updated successfully.', 
        error: null, 
        id, 
        result:data, 
        querydata:qd
      });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).render("userview/update", { 
        success:null, 
        error:`${field} already exists`, 
        id, 
        result:data, 
        querydata:qd 
      });
    }
    console.error('Error updating user:', err);
    return res.status(500).render("userview/update", { 
      success:null, 
      error: 'Internal Server Error.', 
      id, 
      result:data, 
      querydata:qd
    });
  }
};



export const handleDelete = async (req, res) => {
  let { id } = req.params;
  let { page, sortBy, order} = req.query
  console.log(id, page, sortBy, order)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Invalid User ID' });
  }
  try {
    let deleted = await userModels.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).send("User not deleted");
    }
    let limit = process.env.RECORD_LIMIT;  
    let remainingCount = await userModels.countDocuments();
    let totalPages = Math.ceil(remainingCount / limit);
    if (page > totalPages && totalPages > 0) { page = totalPages;}
    if (totalPages === 0) { page = 1;}
    let redirectQuery = `?page=${page}&sortBy=${sortBy}&order=${order}`;
    res.redirect(`/users/${redirectQuery}`);
    console.log("User deleted:", deleted);
  } catch (error) {
    console.error('Error deleting User:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

 
export const handleDeletePost = async (req, res) => {
  const { id } = req.params;
  let page = parseInt(req.body.page) || 1;  
  let sortBy = req.body.sortBy || 'createdAt';
  let order = req.body.order || 'asc';
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Invalid User ID' });
  }
  try {
    const deleted = await userModels.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).send("User not deleted");
    }
    const limit = process.env.RECORD_LIMIT;  
    const remainingCount = await userModels.countDocuments();
    const totalPages = Math.ceil(remainingCount / limit);
    if (page > totalPages && totalPages > 0) { page = totalPages;}
    if (totalPages === 0) { page = 1;}
    const redirectQuery = `?page=${page}&sortBy=${sortBy}&order=${order}`;
    res.redirect(`/users/${redirectQuery}`);
    console.log("User deleted:", deleted);
  } catch (error) {
    console.error('Error deleting User:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
 


export const renderChangePassword = (req, res) => {
  const data = { oldpassword:'', newpassword:'', confirmpassword:'' }
  res.status(200).render('userview/password-change', { 
    userSession: req.session.user, 
    error:null, 
    data, 
    success:null 
  });
};

export const handleChangePassword = async (req, res) => {
  const { oldpassword, newpassword, confirmpassword } = req.body;
  const data = { oldpassword, newpassword, confirmpassword }
  const datablank = { oldpassword:'', newpassword:'', confirmpassword:'' }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  const userSession = req.session.user
  if (!oldpassword || !newpassword || !confirmpassword) {
    return res.status(400).render('userview/password-change', { 
      userSession, 
      error:'All fields are required.', 
      data, 
      success:null 
    });
  }
  if (!passwordRegex.test(oldpassword)) {
    return res.status(400).render('userview/password-change', { 
      userSession, 
      error:'Old Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.', 
      data, 
      success:null 
    });
  }
  if (!passwordRegex.test(newpassword)) {
    return res.status(400).render('userview/password-change', { 
      userSession, 
      error:'New Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.', 
      data, 
      success:null 
    });
  }
  if (newpassword !== confirmpassword) {
    return res.status(400).render('userview/password-change', { 
      userSession, 
      error:'New password and confirm password do not match.', 
      data, 
      success:null 
    });
  }

  try {
    
    const user = await userModels.findById(userSession.id);
    if (!user) {
      return res.status(409).render('userview/password-change', { 
        userSession, 
        error:'User not found.', 
        data:datablank, 
        success:null 
      });
    }
    const isMatch = comparePassword(oldpassword, user.password);
    if (!isMatch) {
      return res.status(409).render('userview/password-change', { 
        userSession, 
        error:'Old password is incorrect.', 
        data:datablank, 
        success:null 
      });
    }
    user.password = await hashedPassword(newpassword);
    const result = await user.save();
     console.log("New User created: ", result);
    res.status(200).render('userview/password-change', {
      userSession,
      error:null,
      data: datablank,
      success: 'Password changed successfully.'
    });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).render('userview/password-change', { 
      userSession, 
      error:'Internal server error.', 
      data, 
      success:null 
    });
  }

};


export const renderDashboard = async (req, res) => {
  const userSession = req.session.user;
  if (!userSession) {
      return res.status(409).render('userview/dashboard', { 
       userSession:null, 
       error:'User Session not available', 
       data:null
      });
  }

  const data = await userModels.findById(userSession.id);
    if (!data) {
      return res.status(409).render('userview/dashboard', { 
       userSession, 
       error:'Error in data fatching', 
       data:null
      });
    }
  res.status(200).render('userview/dashboard', { 
    userSession, 
    error:null,
    data
  });
};
 