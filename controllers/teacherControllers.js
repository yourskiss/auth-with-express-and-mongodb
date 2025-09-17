import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import teacherModels from '../models/teacherModels.js';


export const handleLogout = async (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Logout failed');
    }
    res.clearCookie('connect.sid'); // Optional: clears the session cookie
    res.redirect('/teachers/login'); // Redirect to login page
  });
};
export const renderLogin = async (req, res) => {
  res.render('teacherLogin', { 
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
      return res.status(401).render('teacherLogin', {
            success:null, 
            error: 'Email and Password are required.',
            email: email
          });
    }
    if (!emailRegex.test(email)) {
      return res.status(401).render('teacherLogin', {
            success:null, 
            error: 'Enter valid Email ID',
            email: email
          });
    }
    if (!passwordRegex.test(password)) {
      return res.status(401).render('teacherLogin', {
        success:null, 
        error: 'Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.',
        email: email
      });
    }

  try {
    const result = await teacherModels.findOne({ email });
    if (!result) {
      // return res.status(409).send('Invalid email id'); // Unauthorized email
      return res.status(409).render('teacherLogin', {
          success:null, 
          error: 'Invalid email id',
          email: email
        });
    }
    const isMatch = await bcrypt.compare(password, result.password);
    if (!isMatch) {
      // return res.status(409).send('Invalid password'); // Unauthorized password
      return res.status(409).render('teacherLogin', {
          success:null, 
          error: 'Invalid password',
          email: email
        });
    }
    req.session.userId = result._id; // Save user ID in session
    console.log("session id - ",req.session.userId);
   // res.redirect('/teachers/dashboard');
    return res.status(200).render('teacherLogin', {
          success:'Login successful.', 
          error: null,
          email: email
        });
  } catch (err) {
      console.error('Login error:', err);
    // res.status(500).send('Internal Server Error');
    res.status(500).render('teacherLogin', {
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
    const totalTeachers = await teacherModels.countDocuments();
    const totalPages = Math.ceil(totalTeachers / limit);
    
    const result = await teacherModels.find({}).collation({ locale: 'en', strength: 1 }).sort(sortOptions).skip(skip).limit(limit);
    if (!result || result.length === 0) {
      return res.status(409).render("teacherList", {
        error: "No Teacher found",
        result: [],
        currentPage: 1,
        totalPages: 1,
        sortBy,
        order
      });
    }
    res.render("teacherList", {
      error: null,
      result,
      currentPage: page,
      totalPages,
      sortBy,
      order
    });
  } catch (error) {
    console.error("Error fetching Teacher:", error.message);
    res.status(500).render("teacherList", {
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
    return res.status(400).render('teacherDetail', { error: 'Invalid Teacher id', result: '', querydata });
  }
  try {
    const result = await teacherModels.findById(id);
    if (!result) {
      return res.status(404).render('teacherDetail', { error: 'Teacher not found', result: '', querydata });
    } 
    console.log("Teacher by id - ",result);
    res.render("teacherDetail", { error:null, result:result, querydata });
  } catch (error) {
    console.error('Error fetching Teacher by id:', error.message);
    res.status(500).render('teacherDetail', { error: 'Internal Server Error', result: '', querydata });
  }
};

export const renderAdd = async (req, res) => {
  const data = {fullname: '', mobile: '', email: ''}
  res.render('teacherAddForm', { success:null, error: null, data });
}
export const handleAdd = async (req, res) => {
  const { fullname, mobile, email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  const data = {fullname, mobile, email}
  if (!fullname || !mobile || !email || !password) {
   // return res.status(401).json({ error: "All fields are required." });
    return res.status(401).render('teacherAddForm', {
          success:null,
          error: 'All fields are required.',
          data
        });
  }
  if (!mobileRegex.test(mobile)) {
   // return res.status(401).json({ error: "Mobile number must be exactly 10 digits." });
    return res.status(401).render('teacherAddForm', {
          success:null,
          error: 'Mobile number must be exactly 10 digits.',
          data
        });
  }
  if (!emailRegex.test(email)) {
   // return res.status(401).json({ error: "Email format is invalid." });
    return res.status(401).render('teacherAddForm', {
          success:null,
          error: 'Email format is invalid.',
          data
        });
  }
  if (!passwordRegex.test(password)) {
    return res.status(401).render('teacherAddForm', {
      success:null,
      error: 'Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.',
      data
    });
  }
  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const ud = { fullname, mobile, email, password: hashedPassword }
    const result = await teacherModels.create(ud);
    console.log("New teacher created: ", result);
   // res.status(200).json(result);
   // res.redirect('/teachers');
    return res.status(200).render('teacherAddForm', {
          success:'Teacher added successfully.',
          error: null,
          data
        });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
    //  return res.status(409).json({ error: `${field} already exists.` });
      return res.status(409).render('teacherAddForm', {
          success:null,
          error: `${field} already exists.`,
          data
        });
    }
    // res.status(500).json({ error: "Server error. Please try again later." });
    return res.status(500).render('teacherAddForm', {
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
    // return res.status(404).json({ message: 'Invalid Teacher id' });
    return res.render("teacherUpdateForm", { 
      success:null, 
      error:'Invalid Teacher id', 
      id, 
      result:datablank, 
      querydata 
    });
  }
  try {
    const result = await teacherModels.findById(id);
    if (!result) {
     // return res.status(404).send("Teacher not found");
      return res.render("teacherUpdateForm", { 
        success:null, 
        error: 'Teacher not found', 
        id, 
        result:datablank, 
        querydata 
      });
    } 
    return res.render("teacherUpdateForm", { 
      success:null, 
      error: null, 
      id, 
      result:result, 
      querydata 
    });
  } catch (err) {
  // return res.status(500).send("Server error");
   return res.status(500).render("teacherUpdateForm", { 
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
   // return res.status(400).send("All fields are required");
    return res.status(400).render("teacherUpdateForm", { 
      success:null, 
      error: 'All fields are required', 
      id, 
      result:data, 
      querydata 
    });
  }
  if (!mobileRegex.test(mobile)) {
    // return res.status(400).send("Invalid mobile number");
    return res.status(400).render("teacherUpdateForm", { 
      success:null, 
      error: 'Invalid mobile number', 
      id, 
      result:data, 
      querydata 
    });
  }
  if (!emailRegex.test(email)) {
   // return res.status(400).send("Invalid email format");
    return res.status(400).render("teacherUpdateForm", { 
      success:null, 
      error: 'Invalid email format', 
      id, 
      result:data, 
      querydata 
    });
  }
  try {
    const updated = await teacherModels.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
    if (!updated)  {
      // res.status(404).send("Teacher not Updated");
      return res.status(404).render("teacherUpdateForm", { 
        success:null, 
        error: 'Teacher not Updated', 
        id, 
        result:data, 
        querydata 
      });
    }

    console.log("teacher updated: ", updated);
    // res.redirect(`/teachers/${querydata}`);
    return res.status(200).render("teacherUpdateForm", { 
      success:'Teacher updated successfully.', 
      error: null, 
      id, 
      result:data, 
      querydata 
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
     // return res.status(409).send();
      return res.status(409).render("teacherUpdateForm", { 
        success:null, 
        error:`${field} already exists`, 
        id, 
        result:data, 
        querydata 
      });
    }
    // res.status(500).send("Server error");
    return res.status(500).render("teacherUpdateForm", { 
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
    return res.status(404).json({ message: 'Invalid Teacher ID' });
  }
  try {
    const deleted = await teacherModels.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).send("Teacher not deleted");
    }
    const limit = process.env.RECORD_LIMIT;  
    const remainingCount = await teacherModels.countDocuments();
    const totalPages = Math.ceil(remainingCount / limit);
    if (page > totalPages && totalPages > 0) { page = totalPages;}
    if (totalPages === 0) { page = 1;}
    const redirectQuery = `?page=${page}&sortBy=${sortBy}&order=${order}`;
    res.redirect(`/teachers/${redirectQuery}`);
    console.log("Teacher deleted:", deleted);
  } catch (error) {
    console.error('Error deleting Teacher:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



export const renderChangePassword = (req, res) => {
  const data = { oldpassword:'', newpassword:'', confirmpassword:'' }
  res.status(200).render('passwordChange', { 
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
    return res.status(400).render('passwordChange', { 
      userSessionId: req.session.userId, 
      error:'All fields are required.', 
      data, 
      success:null 
    });
  }
  if (!passwordRegex.test(oldpassword)) {
    return res.status(401).render('passwordChange', { 
      userSessionId: req.session.userId, 
      error:'Old Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.', 
      data, 
      success:null 
    });
  }
  if (!passwordRegex.test(newpassword)) {
    return res.status(401).render('passwordChange', { 
      userSessionId: req.session.userId, 
      error:'New Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.', 
      data, 
      success:null 
    });
  }
  if (newpassword !== confirmpassword) {
    return res.status(400).render('passwordChange', { 
      userSessionId: req.session.userId, 
      error:'New password and confirm password do not match.', 
      data, 
      success:null 
    });
  }

  try {
    const user = await teacherModels.findById(req.session.userId);
    if (!user) {
      return res.status(409).render('passwordChange', { 
        userSessionId: req.session.userId, 
        error:'User not found.', 
        data:datablank, 
        success:null 
      });
    }
    const isMatch = await bcrypt.compare(oldpassword, user.password);
    if (!isMatch) {
      return res.status(409).render('passwordChange', { 
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
     console.log("New teacher created: ", result);
   // res.redirect('/teachers');
    res.status(200).render('passwordChange', {
      userSessionId: req.session.userId,
      error:null,
      data: datablank,
      success: 'Password changed successfully.'
    });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).render('passwordChange', { 
      userSessionId: req.session.userId, 
      error:'Internal server error.', 
      data, 
      success:null 
    });
  }

};