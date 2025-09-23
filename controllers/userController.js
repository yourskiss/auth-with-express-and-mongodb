import userModels from "../models/userModels.js";
import { hashedPassword, comparePassword } from '../utils/password.js';
import { rollQuery } from "../utils/queryHelper.js";
import { getPagination } from "../utils/pagination.js";
import { validateUserInput } from '../utils/validation.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  const query = rollQuery(req.session.user.role, false); 
  const { page, sortBy, order, limit, skip, sort } = getPagination(req);
 
  try {
    const totalCount = await userModels.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    
    const result = await userModels.find(query).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skip).limit(limit);
    if (!result || result.length === 0) {
      return res.status(409).render("userview/list", {
        error: "No record found",
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


 
export const getHided = async (req, res) => {
  const query = rollQuery(req.session.user.role, true); 
  const { page, sortBy, order, limit, skip, sort  } = getPagination(req);
  try {
    const totalCount = await userModels.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    
    const result = await userModels.find(query).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skip).limit(limit);
    if (!result || result.length === 0) {
      return res.status(409).render("userview/list-hide", {
        error: "No record found",
        result: [],
        currentPage: 1,
        totalPages: 1,
        sortBy,
        order
      });
    }
    res.render("userview/list-hide", {
      error: null,
      result,
      currentPage: page,
      totalPages,
      sortBy,
      order
    });
  } catch (error) {
    console.error("Error fetching User:", error.message);
    res.status(500).render("userview/list-hide", {
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
  try {
    const result = await userModels.findById(id);
    if (!result) {
      return res.status(404).render('userview/detail', { 
        error: 'Record not found', 
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
  const data = {fullname, mobile, email, password, role}
  const errorMsg = validateUserInput({ fullname, mobile, email, password, role });
  if (errorMsg.length > 0) {
    return res.status(400).render('userview/create', {
      success:null, 
      error:errorMsg.join(" "),
      data
    });
  }
  try {
    const hashedWithSaltPassword = await hashedPassword(password)
    const ud = { fullname, mobile, email, password:hashedWithSaltPassword, role, otpTemp:null, otpExpiry:null, createdBy:req.session.user.id  }
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
  const qd = { page, sortBy, order };
  const datablank = { id, fullname:'', email:'', mobile:'', role:'' };
  try {
    const result = await userModels.findById(id);
    if (!result) {
      return res.status(404).render("userview/update", { 
        success: null, 
        error: 'Record not found', 
        result: datablank, 
        querydata: qd
      });
    } 
    return res.status(200).render("userview/update", { 
      success: null, 
      error: null, 
      result: result, 
      querydata: qd
    });
  } catch (err) {
    console.error('Error in renderUpdate:', err);
    return res.status(500).render("userview/update", { 
      success: null, 
      error: 'Internal Server Error', 
      result: datablank, 
      querydata: qd
    });
  }
};
export const handleUpdate = async (req, res) => {
const { page, sortBy, order, fullname, email, mobile, password, role } = req.body;
  const { id } = req.params;
  const data = {  id, fullname, email, mobile, role };
  const qd = { page, sortBy, order }

  let errorMsg = null;
  if(req.session.user.id === id) {
    errorMsg = validateUserInput({ fullname, mobile, email });
  } else {
    errorMsg = validateUserInput({ fullname, mobile, email, role });
  }
  if (errorMsg.length > 0) {
    return res.status(400).render('userview/update', {
      success:null, 
      error:errorMsg.join(" "),
      result:data, 
      querydata:qd
    });
  }

  try {
    const user = await userModels.findById(id);
    if (!user) {
      return res.status(404).render("userview/update", {
        success: null,
        error: 'Record not found',
        result: { fullname:'', email:'', mobile:'', role:'' },
        querydata: qd
      });
    }
    const updateData = { fullname, email, mobile, role, updatedBy:req.session.user.id, updatedAt: new Date(), otpTemp:null, otpExpiry:null };
    if (req.file) {
      // Delete old photo file if it exists
      if (user.profilepicture && user.profilepicture.filename) {
        const oldPath = path.join(__dirname, '../public/userprofile', user.profilepicture.filename);
        fs.unlink(oldPath, (err) => {
          if (err) {
            console.error("Failed to delete old photo:", err);
          }
        });
      }
      // Set new photo info
      updateData.profilepicture = {
        url: `/userprofile/${req.file.filename}`,
        filename: req.file.filename,
        contentType: req.file.mimetype
      };
    }

    const updatedUser = await userModels.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedUser)  {
      return res.status(409).render("userview/update", { 
        success:null, 
        error: 'Record not Updated', 
        result:data, 
        querydata:qd 
      });
    }
    return res.status(200).render("userview/update", {
      success: 'Profile updated successfully.',
      error: null,
      result: updatedUser,
      querydata: qd
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).render("userview/update", {
      success: null,
      error: 'Internal Server Error',
      result: { fullname:'', email:'', mobile:'', role:'' },
      querydata: qd
    });
  }
};



export const handleDisabled = async (req, res) => {
  let { id } = req.params;
  const { page, sortBy, order, limit, skip, sort } = getPagination(req);
  try {
    // Soft delete instead of actual delete
    const deleted = await userModels.findByIdAndUpdate(
      id,
      { deletedBy:req.session.user.id, isDeleted: true, deletedAt: new Date(), otpTemp:null, otpExpiry:null },
      { new: true }
    );
    if (!deleted) {
      return res.status(404).send("Record not deleted");
    }

    // After soft-deleting, redirect or respond as before
    let remainingCount = await userModels.countDocuments({ isDeleted: false });
    let totalPages = Math.ceil(remainingCount / limit);
    if (page > totalPages && totalPages > 0) { page = totalPages; }
    if (totalPages === 0) { page = 1; }

    let redirectQuery = `?page=${page}&sortBy=${sortBy}&order=${order}`;
    res.redirect(`/users/${redirectQuery}`);
    console.log("User soft-deleted:", deleted);
  } catch (error) {
    console.error('Error soft deleting User:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const handleEnabled = async (req, res) => {
let { id } = req.params;
const { page,  sortBy, order, limit, skip, sort } = getPagination(req);

  try {
    // Soft delete instead of actual delete
    const deleted = await userModels.findByIdAndUpdate(
      id,
      { deletedBy:null, isDeleted: false, deletedAt:null, otpTemp:null, otpExpiry:null },
      { new: true }
    );
    if (!deleted) {
      return res.status(404).send("Record not deleted  ");
    }

    // After soft-deleting, redirect or respond as before
    let remainingCount = await userModels.countDocuments({ isDeleted: true });
    let totalPages = Math.ceil(remainingCount / limit);
    if (page > totalPages && totalPages > 0) { page = totalPages; }
    if (totalPages === 0) { page = 1; }

    let redirectQuery = `?page=${page}&sortBy=${sortBy}&order=${order}`;
    res.redirect(`/users/hide/${redirectQuery}`);
    console.log("User soft-deleted:", deleted);
  } catch (error) {
    console.error('Error soft deleting User:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
 
export const handleDelete = async (req, res) => {
  const { id } = req.params;
  const { page, sortBy, order, limit, skip, sort } = getPagination(req);

  try {
    const deleted = await userModels.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).send("Record not deleted");
    }
 
    const remainingCount = await userModels.countDocuments();
    const totalPages = Math.ceil(remainingCount / limit);
    if (page > totalPages && totalPages > 0) { page = totalPages;}
    if (totalPages === 0) { page = 1;}


    const redirectQuery = `?page=${page}&sortBy=${sortBy}&order=${order}`;
    res.redirect(`/users/hide/${redirectQuery}`);
    console.log("User deleted:", deleted);
  } catch (error) {
    console.error('Error deleting User:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
 


export const renderChangePassword = (req, res) => {
  const data = { oldpassword:'', newpassword:'', confirmpassword:'' }
  res.status(200).render('userview/password-change', { 
    success:null,
    error:null, 
    data
  });
};

  export const handleChangePassword = async (req, res) => {
  const { oldpassword, password, confirmpassword } = req.body;
  const data = { oldpassword, password, confirmpassword }
  const userSessionID = req.session.user.id;
 
  if (!userSessionID) {
    return res.status(401).render('userview/password-change', {
      success: null,
      error: "Unauthorized access.",
      data
    });
  }
  const errorMsg = validateUserInput({ oldpassword, password, confirmpassword  });
  if (errorMsg.length > 0) {
    return res.status(400).render('userview/password-change', {
      success:null, 
      error:errorMsg.join(", "),
      data,
    });
  }
   
  try {
    const result = await userModels.findById(userSessionID);
    if (!result) {
      return res.status(409).render('userview/password-change', {  
        success:null,
        error:'Record not found.', 
        data
      });
    }
    const isMatch = await comparePassword(oldpassword, result.password);
    if (!isMatch) {
      return res.status(409).render('userview/password-change', { 
        success:null,
        error:'Old password is incorrect.', 
        data
      });
    }
    result.password = await hashedPassword(password);
    const saved = await result.save();
    if(!saved) {
      res.status(200).render('userview/password-change', {
        success: 'Password Not changed.',
        error:null,
        data
      });
    }
    res.status(200).render('userview/password-change', {
      success: 'Password changed successfully.',
      error:null,
      data
    });
  
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).render('userview/password-change', {  
      success:null,
      error:'Internal server error.', 
      data
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
 