import bcrypt from 'bcrypt';
import { sendOtpEmail } from '../utils/sendOTP.js';
import userModels from "../models/userModels.js";


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



export const renderPasswordForget = (req, res) => {
  res.status(200).render('userview/password-forget', { 
    success:null, 
    error:null,
    email: ''
  });
};  
export const handlePasswordForget = async (req, res) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return res.status(400).render("userview/password-forget", {
      success: null,
      error: 'Email is required',
      email
    });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).render("userview/password-forget", {
      success: null,
      error: 'Invalid email format',
      email
    });
  }
  try {
    // Check if user exists
    const checkuserbyemail = await userModels.findOne({ email });
    if (!checkuserbyemail) {
      return res.status(409).render('userview/password-forget', {
        success: null,
        error: 'Email not found',
        email
      });
    }
    
    // Generate 6 digit random number
    const otpExpireTime = process.env.OTP_TIME || 10;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + otpExpireTime * 60 * 1000); // minutes from now
    
    // Save OTP and time in DB
    checkuserbyemail.resetOtp = otp;
    checkuserbyemail.otpExpiry = expiry;

    // Update user with OTP details
    await checkuserbyemail.save();  
    console.log(`OTP ${otp} genrated, It will be expire in - ${otpExpireTime} minutes. ===> ${expiry}`);

    // Send OTP to email
    await sendOtpEmail(email, otp); 
    console.log(`OTP ${otp} sent to ${email}`);

    // Store email in session
    req.session.fpStep1 = email; 
    console.log(`forgetPassword Session step 1 - ${req.session.fpStep1}`);

    res.status(200).render('userview/password-forget', {  
            success: `OTP sent to ${email}. It will expire in ${otpExpireTime} minutes.`,
            error: null,
            email
        });
  } catch (err) {
    console.error('Forget password error:', err);
    res.status(500).render('userview/password-forget', {
      success: null,
      error: 'Internal server error',
      email
    });
  }
};

export const renderPasswordOtp  = (req, res) => {
  const email = req.session.fpStep1;
  if (!email) {
    return  res.status(400).render('userview/password-otp', {
      success: null,
      info:'Verify your email first.',
      error: null,
      email 
    });
  }
  res.status(200).render('userview/password-otp', { 
    success:null, 
    info:null,
    error:null,
    email
  });
}; 
export const handlePasswordOtp = async (req, res) => {
  const { otp } = req.body;
  const email = req.session.fpStep1;
  try {
    const user = await userModels.findOne({ email });
    if (!user || user.resetOtp !== otp) {
      return res.status(400).render('userview/password-otp', {
        success: null,
        info:null,
        error: 'Invalid OTP',
        email
      });
    }
    if (user.otpExpiry < new Date()) {
      return res.status(400).render('userview/password-otp', {
        success: null,
        info:null,
        error: 'OTP has expired',
        email
      });
    }

    // Store verifyOTP in session
    req.session.fpStep2 = true; 
    console.log(`verifyOTP Session step 2 - ${req.session.fpStep2}`);

    // OTP verified successfully
    res.render('userview/password-otp', {
      success: 'OTP verified. You can now reset your password.',
      info:null,
      error: null,
      email,
    });

  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).render('userview/password-otp', {
      success: null,
      info:null,
      error: 'Internal server error',
      email,
    });
  }
};




export const renderPasswordReset = (req, res) => {
  const email = req.session.fpStep1;
  if (!req.session.fpStep1 && !req.session.fpStep2) {
    return  res.status(400).render('userview/password-reset', {
      success: null,
      info:'Please verify OTP first.',
      error: null,
      email,
      password:'',
      confirmPassword:''
    });
  }
  res.status(200).render('userview/password-reset', { 
    success:null, 
    info:null,
    error:null,
    email,
    password:'',
    confirmPassword:''
  });
}; 

export const handlePasswordReset = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const email = req.session.fpStep1;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  if (!password || !confirmPassword) {
    return res.status(400).render('userview/password-reset', {
      success: null,
      info:null,
      error: 'Passwords do not match or are empty',
      email,
      password,
      confirmPassword
    });
  }
  if (!passwordRegex.test(password)) {
    return res.status(400).render('userview/password-reset', { 
      error:'Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.', 
      info:null,
      success:null,
      email,
      password,
      confirmPassword
    });
  }
  if (password !== confirmPassword) {
    return res.status(400).render('userview/password-reset', { 
      success:null,
      info:null,
      error:'New password and confirm password do not match.', 
      email,
      password,
      confirmPassword
    });
  }

  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userModels.findOneAndUpdate(
      { email },
      { password: hashedPassword, resetOtp: null, otpExpiry: null },
      { new: true }
    );

    if (!user) {
      return res.status(400).render('userview/password-reset', {
        email,
        success: null,
        info:null,
        error: 'User not found',
        password,
        confirmPassword
      });
    }

    // Clear session data related to password reset
    console.log(`Both before destroy - ${req.session.fpStep1} - ${req.session.fpStep2}`);
    req.session.fpStep1 = null;
    req.session.fpStep2 = null;
    console.log(`Both after destroy - ${req.session.fpStep1} - ${req.session.fpStep2}`);


    res.render('userview/password-reset', {
      success: 'Password reset successfully! You can now log in.',
      info:null,
      error: null,
      email,
      password,
      confirmPassword
    });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).render('userview/password-reset', {
      email,
      success: null,
      info:null,
      error: 'Internal server error',
      password,
      confirmPassword
    });
  }
};
