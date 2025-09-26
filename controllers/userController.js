import userModels from "../models/userModels.js";
import { hashedPassword, comparePassword } from '../utils/password.js';
import { rollQuery } from "../utils/queryHelper.js";
import { getPagination } from "../utils/pagination.js";
import { validateUserInput } from '../utils/validation.js';
import { 
  returnList, returnDetails, returnAdd, returnUpdate, returnChangePassword, returnDashboard 
} from "../utils/renderHandler.js";

import { processProfileImage } from '../utils/uploadProcessor.js';




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
  let totalPages = 1;
  try {
    let totalCount = await userModels.countDocuments(query);
    totalPages = Math.ceil(totalCount / limit);
    const result = await userModels.find(query)
                  .collation({ locale: 'en', strength: 1 })
                  .sort(sort)
                  .skip(skip)
                  .limit(limit);
    if (!result || result.length === 0) {
      return returnList({ 
        res, 
        status:409, 
        view: 'list', 
        error: "No record found", 
        result:[], 
        currentPage:page, 
        totalPages, 
        sortBy, 
        order 
      });
    }
     return returnList({ 
        res, 
        status:200, 
        view: 'list', 
        error: null, 
        result, 
        currentPage:page, 
        totalPages, 
        sortBy, 
        order 
      });
      
  } catch (error) {
    return returnList({ 
        res, 
        status:500, 
        view: 'list', 
        error: "Internal Server Error", 
        result:[], 
        currentPage:page, 
        totalPages, 
        sortBy, 
        order 
      });
  }
};


 
export const getHided = async (req, res) => {
  const query = rollQuery(req.session.user.role, true); 
  const { page, sortBy, order, limit, skip, sort  } = getPagination(req);
  let totalPages = 1;
  try {
    const totalCount = await userModels.countDocuments(query);
    totalPages = Math.ceil(totalCount / limit);
    
    const result = await userModels.find(query)
                  .collation({ locale: 'en', strength: 1 })
                  .sort(sort)
                  .skip(skip)
                  .limit(limit);
    if (!result || result.length === 0) {
      return returnList({ 
        res, 
        status:409, 
        view: 'list-hide', 
        error: "No record found", 
        result:[], 
        currentPage:page, 
        totalPages, 
        sortBy, 
        order 
      });
    }
     return returnList({ 
        res, 
        status:200, 
        view: 'list-hide', 
        error: null, 
        result, 
        currentPage:page, 
        totalPages, 
        sortBy, 
        order 
      });
  } catch (error) {

    return returnList({ 
        res, 
        status:500, 
        view: 'list-hide', 
        error: "Internal Server Error", 
        result:[], 
        currentPage:page, 
        totalPages, 
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
      return returnDetails({ 
        res, 
        status:404, 
        view: 'detail', 
        error: "Record not found", 
        result:[], 
        querydata
      });
    } 
      return returnDetails({ 
        res, 
        status:200, 
        view: 'detail', 
        error:null, 
        result:result, 
        querydata
      });
  } catch (error) {
      return returnDetails({ 
        res, 
        status:500, 
        view: 'detail', 
        error: 'Internal Server Error', 
        result:[], 
        querydata
      });
  }
};


 


export const renderAdd = async (req, res) => {
  const data = {fullname: '', mobile: '', email: ''}
      return returnAdd({ 
        res, 
        status:200, 
        view: 'create', 
        success:null, 
        error: null, 
        data
      });
}
export const handleAdd = async (req, res) => {
  const { fullname, mobile, email, password, role } = req.body;
  const data = {fullname, mobile, email, password, role}
  const errorMsg = await validateUserInput({ fullname, mobile, email, password, role });
  if (Object.keys(errorMsg).length > 0) {
      return returnAdd({ 
        res, 
        status:200, 
        view: 'create', 
        success:null, 
        error:errorMsg,
        data
      });
  }
  try {
    const hashedWithSaltPassword = await hashedPassword(password)
    const ud = { fullname, mobile, email, password:hashedWithSaltPassword, role, otpTemp:null, otpExpiry:null, createdBy:req.session.user.id  }
    const result = await userModels.create(ud);
      if (!result) {
        return returnAdd({ 
          res, 
          status:400, 
          view: 'create', 
          success:null,
          error: 'Something went wrong.',
          data
        });
      }
      return returnAdd({ 
        res, 
        status:200, 
        view: 'create', 
        success:'User added successfully.',
        error: null,
        data
      });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return returnAdd({ 
        res, 
        status:409, 
        view: 'create', 
        success:null,
        error: `${field} already exists.`,
        data
      });
    }
    return returnAdd({ 
        res, 
        status:200, 
        view: '500', 
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
      return returnUpdate({ 
        res, 
        status:404, 
        view: 'update', 
        success: null, 
        error: "Record not found", 
        result:datablank, 
        querydata:qd
      });
    } 
    return returnUpdate({ 
        res, 
        status:200, 
        view: 'update', 
        success:null, 
        error:null, 
        result:result, 
        querydata:qd
    });
  } catch (err) {
    return returnUpdate({ 
        res, 
        status:500, 
        view: 'update', 
        success: null, 
        error: 'Internal Server Error', 
        result:datablank, 
        querydata:qd
    });
  }
};


export const handleUpdate = async (req, res) => {
  const { page, sortBy, order, fullname, email, mobile, role } = req.body;
  const img = req.file;
  const { id } = req.params;
  const data = { id, fullname, email, mobile, role };
  const qd = { page, sortBy, order };

  let errorMsg = req.session.user.id === id
    ? await validateUserInput({ fullname, mobile, email })
    : await validateUserInput({ fullname, mobile, email, role });

  if (Object.keys(errorMsg).length > 0) {
    return returnUpdate({ res, status: 400, view: 'update', success: null, error: errorMsg, result: data, querydata: qd });
  }

  try {
    const user = await userModels.findById(id);
    if (!user) {
      return returnUpdate({ res, status: 404, view: 'update', success: null, error: 'Record not found', result: { fullname: '', email: '', mobile: '', role: '' }, querydata: qd });
    }

    const updateData = {
      fullname,
      email,
      mobile,
      role,
      updatedBy: req.session.user.id,
      updatedAt: new Date(),
      otpTemp: null,
      otpExpiry: null
    };

    if (img) {
      const profileData = await processProfileImage(img, user.profilepicture, user.id);
      updateData.profilepicture = profileData;
    }

    const updatedUser = await userModels.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedUser) {
      return returnUpdate({ res, status: 409, view: 'update', success: null, error: 'Not Updated', result: data, querydata: qd });
    }

    return returnUpdate({ res, status: 200, view: 'update', success: 'Profile updated successfully.', error: null, result: data, querydata: qd });
  } catch (err) {
    console.error(err);
    return returnUpdate({ res, status: 500, view: 'update', success: null, error: 'Internal Server Error', result: data, querydata: qd });
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
  return returnChangePassword({ 
        res, 
        status:200, 
        view: 'password-change', 
        success: null, 
        error: null, 
        data
  });
};

export const handleChangePassword = async (req, res) => {
  const { oldpassword, password, confirmpassword } = req.body;
  const data = { oldpassword, password, confirmpassword }
  const userSessionID = req.session.user.id;
  if (!userSessionID) {
    return returnChangePassword({ 
        res, 
        status:401, 
        view: 'password-change', 
        success: null, 
        error: "Unauthorized access.",
        data
    });
  }
  const errorMsg = await validateUserInput({ oldpassword, password, confirmpassword  });
  if (Object.keys(errorMsg).length > 0) {
    return returnChangePassword({ 
        res, 
        status:400, 
        view: 'password-change', 
        success: null, 
        error:errorMsg,
        data
    });
  }
   
  try {
    const result = await userModels.findById(userSessionID);
    if (!result) {
      return returnChangePassword({ 
        res, 
        status:404, 
        view: 'password-change', 
        success: null, 
        error:'Record not found.', 
        data
      });
    }
    const isMatch = await comparePassword(oldpassword, result.password);
    if (!isMatch) {
      return returnChangePassword({ 
            res, 
            status:409, 
            view: 'password-change', 
            success: null, 
            error:'Old password is Incorrect.', 
            data
      });
    }
    result.password = await hashedPassword(password);
    const saved = await result.save();
    if(!saved) {
      return returnChangePassword({ 
        res, 
        status:201, 
        view: 'password-change', 
        success: null, 
        error: 'Password Not changed.', 
        data
      });
    }
    return returnChangePassword({ 
        res, 
        status:200, 
        view: 'password-change', 
        success: 'Password changed successfully.', 
        error: null, 
        data
  });
  } catch (err) {
      return returnChangePassword({ 
        res, 
        status:500, 
        view: 'password-change', 
        success: null, 
        error:'Internal server error.', 
        data
      });
  }
};


export const renderDashboard = async (req, res) => {
  const userSession = req.session.user;
  if (!userSession) {
    return returnDashboard({ 
        res, 
        status:400, 
        view: 'dashboard', 
        userSession: null, 
        error:'User Session not available', 
        data: []
    });
  }
  const data = await userModels.findById(userSession.id);
  if (!data) {
    return returnDashboard({ 
        res, 
        status:409, 
        view: 'dashboard', 
        userSession, 
        error:'Error in data fatching', 
        data: []
    });
  }
  return returnDashboard({ 
        res, 
        status:409, 
        view: 'dashboard', 
        userSession, 
        error:null, 
        data
  });
};
 