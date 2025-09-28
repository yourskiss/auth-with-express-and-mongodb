import userModels from "../models/userModels.js";
import { hashedPassword, comparePassword } from '../utils/password.js';
import { rollQuery } from "../utils/queryHelper.js";
import { getPagination } from "../utils/pagination.js";
import { validateUserInput } from '../utils/validation.js';
import { 
  returnList, returnDetails, returnAdd, returnUpdate, returnChangePassword, returnDashboard 
} from "../utils/renderHandler.js";
import { processProfileImage } from '../utils/uploadProcessor.js';
import { wlogs } from '../utils/winstonLogger.js'; // logger



export const handleLogout = async (req, res) => {
  req.session.destroy(err => {
    if (err) {
      wlogs(req, 'error', 'Logout - failed',  400);
      console.error('Logout error:', err);
      return res.status(500).send('Logout failed');
    }
    wlogs(req, 'info', 'Logout - Successfull',  302);
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
      wlogs(req, 'warn', 'Active User List - Successfull',  204);
      return returnList({ 
        res, 
        status:204, 
        view: 'list', 
        error: "No record found", 
        result:[], 
        currentPage:page, 
        totalPages, 
        sortBy, 
        order 
      });
    }
     wlogs(req, 'info', 'Active User List - Successfull',  200);
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
    wlogs(req, 'error', 'Active User List - Internal Server Error',  500);
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
      wlogs(req, 'error', 'Inactive User List - Not Found', 409);
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
    wlogs(req, 'info', 'Inactive User List - Success', 200);
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
    wlogs(req, 'error', 'Inactive User List - Internal Server Error', 500);
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
      wlogs(req, 'error', 'User Detail - Not Found', 409);
      return returnDetails({ 
        res, 
        status:409, 
        view: 'detail', 
        error: "Record not found", 
        result:[], 
        querydata
      });
    } 
      wlogs(req, 'info', 'User Detail - Success', 200);
      return returnDetails({ 
        res, 
        status:200, 
        view: 'detail', 
        error:null, 
        result:result, 
        querydata
      });
  } catch (error) {
      wlogs(req, 'error', 'User Detail - Internal Server Error', 500);
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
      wlogs(req, 'error', 'Create User - Invalid Input',  400);
      return returnAdd({ 
        res, 
        status:400, 
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
        wlogs(req, 'error', 'Create User - Something went wrong',  409);
        return returnAdd({ 
          res, 
          status:409, 
          view: 'create', 
          success:null,
          error: 'Something went wrong.',
          data
        });
      }
      wlogs(req, 'info', 'Create User - Successfully', 200);
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
      wlogs(req, 'warn', 'Create User - already exists.',  409);
      return returnAdd({ 
        res, 
        status:409, 
        view: 'create', 
        success:null,
        error: `${field} already exists.`,
        data
      });
    }
    wlogs(req, 'error', 'Create User - Internal Server Error.',  500);
    return returnAdd({ 
        res, 
        status:500, 
        view: 'create', 
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
      wlogs(req, 'error', 'Update User - Not Found',  404);
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
    wlogs(req, 'info', 'Update User - User Fetched',  200);
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
    wlogs(req, 'info', 'Update User - Internal Server Error',  200);
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
    wlogs(req, 'error', 'Update User - Invalid Input',  400);
    return returnUpdate({ 
      res, 
      status: 400, 
      view: 'update', 
      success: null, 
      error: errorMsg, 
      result: data, 
      querydata: qd 
    });
  }

  try {
    const user = await userModels.findById(id);
    if (!user) {
      wlogs(req, 'warn', 'Update User - Not Found',  409);
      return returnUpdate({ 
        res, 
        status: 
        404, 
        view: 'update', 
        success: null, 
        error: 'Record not found', 
        result: data,
        querydata: qd 
      });
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
      wlogs(req, 'warn', 'Update User - Not Updated',  409);
      return returnUpdate({ 
        res, 
        status: 409, 
        view: 'update', 
        success: null, 
        error: 'Not Updated', 
        result: data, 
        querydata: qd 
      });
    }
    wlogs(req, 'info', 'Update User - successfull',  200);
    return returnUpdate({ 
      res, 
      status: 200, 
      view: 'update', 
      success: 'Profile updated successfully.', 
      error: null, 
      result: data, 
      querydata: qd 
    });
  } catch (err) {
    wlogs(req, 'error', 'Update User - Internal Server Error',  500);
    return returnUpdate({ 
      res, 
      status: 500, 
      view: 'update', 
      success: null, 
      error: 'Internal Server Error', 
      result: data, 
      querydata: qd 
    });
  }
};


export const handleDisabled = async (req, res) => {
  let { id } = req.params;
  const { page, sortBy, order, limit, skip, sort } = getPagination(req);
  try {
    const isDisabled = await userModels.findByIdAndUpdate(
      id,
      { deletedBy:req.session.user.id, isDeleted: true, deletedAt: new Date(), otpTemp:null, otpExpiry:null },
      { new: true }
    );
    if (!isDisabled) {
      wlogs(req, 'error', 'Disable User - Not Disabled',  404);
      return res.status(404).send("Record not Disabled");
    }
 
    let remainingCount = await userModels.countDocuments({ isDeleted: false });
    let totalPages = Math.ceil(remainingCount / limit);
    if (page > totalPages && totalPages > 0) { page = totalPages; }
    if (totalPages === 0) { page = 1; }

    wlogs(req, 'info', 'Disable User - Successfull',  302);
    let redirectQuery = `?page=${page}&sortBy=${sortBy}&order=${order}`;
    res.redirect(`/users/${redirectQuery}`);
 
  } catch (error) {
    wlogs(req, 'error', 'Disable User - Internal Server Error',  500);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
 
export const handleEnabled = async (req, res) => {
let { id } = req.params;
const { page,  sortBy, order, limit, skip, sort } = getPagination(req);

  try {
    const isEnabled = await userModels.findByIdAndUpdate(
      id,
      { deletedBy:null, isDeleted: false, deletedAt:null, otpTemp:null, otpExpiry:null },
      { new: true }
    );
    if (!isEnabled) {
      wlogs(req, 'error', 'Enable User - Not Enabled',  404);
      return res.status(404).send("Record not Enabled  ");
    }
 
    let remainingCount = await userModels.countDocuments({ isDeleted: true });
    let totalPages = Math.ceil(remainingCount / limit);
    if (page > totalPages && totalPages > 0) { page = totalPages; }
    if (totalPages === 0) { page = 1; }

    wlogs(req, 'info', 'Enable User - Successfull',  302);
    let redirectQuery = `?page=${page}&sortBy=${sortBy}&order=${order}`;
    res.redirect(`/users/hide/${redirectQuery}`);

  } catch (error) {
    wlogs(req, 'error', 'Disable User - Internal Server Error',  500);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
 
export const handleDelete = async (req, res) => {
  const { id } = req.params;
  const { page, sortBy, order, limit, skip, sort } = getPagination(req);

  try {
    const deleted = await userModels.findByIdAndDelete(id);
    if (!deleted) {
      wlogs(req, 'error', 'Delete User - Not Deleted',  404);
      return res.status(404).send("Record not deleted");
    }
 
    const remainingCount = await userModels.countDocuments();
    const totalPages = Math.ceil(remainingCount / limit);
    if (page > totalPages && totalPages > 0) { page = totalPages;}
    if (totalPages === 0) { page = 1;}

    wlogs(req, 'info', 'Delete User - Successfull',  302);
    const redirectQuery = `?page=${page}&sortBy=${sortBy}&order=${order}`;
    res.redirect(`/users/hide/${redirectQuery}`);
 
  } catch (error) {
    wlogs(req, 'error', 'Delete User - Internal Server Error',  500);
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
  
  const errorMsg = await validateUserInput({ oldpassword, password, confirmpassword  });
  if (Object.keys(errorMsg).length > 0) {
    wlogs(req, 'error', 'Change Password - Invalid Input',  400);
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
      wlogs(req, 'warn', 'Change Password - Not Found',  404);
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
      wlogs(req, 'warn', 'Change Password - Incorrect Old password',  409);
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
      wlogs(req, 'warn', 'Change Password - Not Changed.',  409);
      return returnChangePassword({ 
        res, 
        status:409, 
        view: 'password-change', 
        success: null, 
        error: 'Password Not changed.', 
        data
      });
    }
    wlogs(req, 'info', 'Change Password - Successfully',  200);
    return returnChangePassword({ 
        res, 
        status:200, 
        view: 'password-change', 
        success: 'Password changed successfully.', 
        error: null, 
        data
  });
  } catch (err) {
      wlogs(req, 'error', 'Change Password - Internal server error',  500);
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
  const data = await userModels.findById(userSession.id);
  if (!data) {
    wlogs(req, 'error', 'Dashboard - Error',  409);
    return returnDashboard({ 
        res, 
        status:409, 
        view: 'dashboard', 
        userSession, 
        error:'Error in data fatching', 
        data: []
    });
  }
  wlogs(req, 'info', 'Dashboard - Successfull',  200);
  return returnDashboard({ 
        res, 
        status:200, 
        view: 'dashboard', 
        userSession, 
        error:null, 
        data
  });
};
 