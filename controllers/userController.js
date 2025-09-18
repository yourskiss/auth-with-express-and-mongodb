import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import userModels from "../models/userModels.js";
 


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
export const renderLogin = async (req, res) => {
  res.render('userview/login', { 
    success:null, 
    error: null, 
    email: '' 
  });
}
 
export const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  if (!email || !password) {
      return res.status(401).render('userview/login', {
            success:null, 
            error: 'Email and Password are required.',
            email: email
          });
    }
    if (!emailRegex.test(email)) {
      return res.status(401).render('userview/login', {
            success:null, 
            error: 'Enter valid Email ID',
            email: email
          });
    }
    if (!passwordRegex.test(password)) {
      return res.status(401).render('userview/login', {
        success:null, 
        error: 'Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.',
        email: email
      });
    }

  try {
    const result = await userModels.findOne({ email });
    if (!result) {
      return res.status(409).render('userview/login', {
          success:null, 
          error: 'Invalid email id',
          email: email
        });
    }
    const isMatch = await bcrypt.compare(password, result.password);
    if (!isMatch) {
      return res.status(409).render('userview/login', {
          success:null, 
          error: 'Invalid password',
          email: email
        });
    }
    req.session.userId = result._id; // Save user ID in session
    console.log("session id - ",req.session.userId);
    return res.status(200).render('userview/login', {
          success:'Login successful.', 
          error: null,
          email: email
        });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).render('userview/login', {
        success:null, 
        error: 'Internal Server Error',
        email: email
    });
  }
};

 
export const getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // current page number
  const limit = process.env.RECORD_LIMIT; 
  const skip = (page - 1) * limit;
  
  const sortBy = req.query.sortBy || 'createdAt'; // default field
  const order = req.query.order === 'desc' ? -1 : 1; // default A-Z
  const sortOptions = {};
  sortOptions[sortBy] = order;

  try {
    const totalCount = await userModels.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);
    
    const result = await userModels.find({}).collation({ locale: 'en', strength: 1 }).sort(sortOptions).skip(skip).limit(limit);
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
  const { fullname, mobile, email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  const data = {fullname, mobile, email}
  if (!fullname || !mobile || !email || !password) {
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
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const ud = { fullname, mobile, email, password: hashedPassword }
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
  const querydata = `?page=${page}&sortBy=${sortBy}&order=${order}`;
  const datablank = { fullname:'', email:'', mobile:'' };
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).render("userview/update", { 
        success:null, 
        error:'Invalid User id', 
        id, 
        result:datablank, 
        querydata 
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
          querydata 
        });
    } 
    return res.status(200).render("userview/update", { 
        success:null, 
        error: null, 
        id, 
        result:result, 
        querydata 
      });
  } catch (err) {
   return res.status(500).render("userview/update", { 
      success:null, 
      error: 'Internal Server Error', 
      id, 
      result:datablank, 
      querydata 
    });
  }
};
export const handleUpdate = async (req, res) => {
  const { querydata, fullname, email, mobile } = req.body;
  const { id } = req.params;
  const data = { fullname, email, mobile };
 
  const mobileRegex = /^[6-9]\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!fullname || !email || !mobile) {
    return res.status(400).render("userview/update", { 
      success:null, 
      error: 'All fields are required', 
      id, 
      result:data, 
      querydata 
    });
  }
  if (!mobileRegex.test(mobile)) {
    return res.status(400).render("userview/update", { 
      success:null, 
      error: 'Invalid mobile number', 
      id, 
      result:data, 
      querydata 
    });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).render("userview/update", { 
      success:null, 
      error: 'Invalid email format', 
      id, 
      result:data, 
      querydata 
    });
  }
  try {
    const updated = await userModels.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
    if (!updated)  {
      return res.status(409).render("userview/update", { 
        success:null, 
        error: 'User not Updated', 
        id, 
        result:data, 
        querydata 
      });
    }

    console.log("User updated: ", updated);
    return res.status(200).render("userview/update", { 
      success:'User updated successfully.', 
      error: null, 
      id, 
      result:data, 
      querydata 
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).render("userview/update", { 
        success:null, 
        error:`${field} already exists`, 
        id, 
        result:data, 
        querydata 
      });
    }
    console.error('Error updating user:', err);
    return res.status(500).render("userview/update", { 
      success:null, 
      error: 'Internal Server Error.', 
      id, 
      result:data, 
      querydata 
    });
  }
};


export const handleDelete = async (req, res) => {
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
    userSessionId: req.session.userId, 
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
  if (!oldpassword || !newpassword || !confirmpassword) {
    return res.status(400).render('userview/password-change', { 
      userSessionId: req.session.userId, 
      error:'All fields are required.', 
      data, 
      success:null 
    });
  }
  if (!passwordRegex.test(oldpassword)) {
    return res.status(400).render('userview/password-change', { 
      userSessionId: req.session.userId, 
      error:'Old Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.', 
      data, 
      success:null 
    });
  }
  if (!passwordRegex.test(newpassword)) {
    return res.status(400).render('userview/password-change', { 
      userSessionId: req.session.userId, 
      error:'New Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.', 
      data, 
      success:null 
    });
  }
  if (newpassword !== confirmpassword) {
    return res.status(400).render('userview/password-change', { 
      userSessionId: req.session.userId, 
      error:'New password and confirm password do not match.', 
      data, 
      success:null 
    });
  }

  try {
    const user = await userModels.findById(req.session.userId);
    if (!user) {
      return res.status(409).render('userview/password-change', { 
        userSessionId: req.session.userId, 
        error:'User not found.', 
        data:datablank, 
        success:null 
      });
    }
    const isMatch = await bcrypt.compare(oldpassword, user.password);
    if (!isMatch) {
      return res.status(409).render('userview/password-change', { 
        userSessionId: req.session.userId, 
        error:'Old password is incorrect.', 
        data:datablank, 
        success:null 
      });
    }
    const salt = await bcrypt.genSalt(12);
    const hashedNewPassword = await bcrypt.hash(newpassword, salt);
    user.password = hashedNewPassword;
    const result = await user.save();
     console.log("New User created: ", result);
    res.status(200).render('userview/password-change', {
      userSessionId: req.session.userId,
      error:null,
      data: datablank,
      success: 'Password changed successfully.'
    });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).render('userview/password-change', { 
      userSessionId: req.session.userId, 
      error:'Internal server error.', 
      data, 
      success:null 
    });
  }

};


export const renderDashboard = (req, res) => {
  res.status(200).render('userview/dashboard', { 
    userSessionId: req.session.userId, 
  });
};
 