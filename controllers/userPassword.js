import bcrypt from 'bcrypt';
import { sendOtpEmail } from '../utils/sendOTP.js';
import userModels from "../models/userModels.js";

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
    // Generate 6 digit random number
    const otpExpireTime = process.env.OTP_TIME || 10;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + otpExpireTime * 60 * 1000); // minutes from now
    
    // Check if user exists
    const checkuserbyemail = await userModels.findOne({ email });
    if (!checkuserbyemail) {
      return res.status(409).render('userview/password-forget', {
        success: null,
        error: 'Email not found',
        email
      });
    }
    // Save OTP and expiry in DB
    checkuserbyemail.resetOtp = otp;
    checkuserbyemail.otpExpiry = expiry;
 
    await checkuserbyemail.save();  // Update user with OTP details
    console.log(`OTP ${otp} genrated, It will be expire in - ${expiry}`);
    await sendOtpEmail(email, otp); // Send OTP to email
    console.log(`OTP ${otp} sent to ${email}`);
    res.status(200).render('userview/password-forget', {  
            success: `OTP sent to ${email}`,
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
    const email = req.query.email || '';
  res.status(200).render('userview/password-otp', { 
    success:null, 
    error:null,
    email
  });
}; 
export const handlePasswordOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await userModels.findOne({ email });
    if (!user || user.resetOtp !== otp) {
      return res.status(400).render('userview/password-otp', {
        success: null,
        error: 'Invalid OTP',
        email
      });
    }
    if (user.otpExpiry < new Date()) {
      return res.status(400).render('userview/password-otp', {
        success: null,
        error: 'OTP has expired',
        email
      });
    }

    // OTP verified successfully
    res.render('userview/password-otp', {
      success: 'OTP verified. You can now reset your password.',
      error: null,
      email,
    });

  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).render('userview/password-otp', {
      success: null,
      error: 'Internal server error',
      email,
    });
  }
};




export const renderPasswordReset = (req, res) => {
     const email = req.query.email || '';
  res.status(200).render('userview/password-reset', { 
    success:null, 
    error:null,
    email: email,
    password:'',
    confirmPassword:''
  });
}; 

export const handlePasswordReset = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  if (!password || !confirmPassword) {
    return res.status(400).render('userview/password-reset', {
      email,
      success: null,
      error: 'Passwords do not match or are empty',
      password,
      confirmPassword
    });
  }
  if (!passwordRegex.test(password)) {
    return res.status(400).render('userview/password-change', { 
      error:'Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.', 
      data, 
      success:null,
      password,
      confirmPassword
    });
  }
  if (password !== confirmPassword) {
    return res.status(400).render('userview/password-reset', { 
      error:'New password and confirm password do not match.', 
      data, 
      success:null,
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
        error: 'User not found',
        password,
        confirmPassword
      });
    }

    res.render('userview/password-reset', {
      email,
      success: 'Password reset successfully! You can now log in.',
      error: null,
      password,
      confirmPassword
    });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).render('userview/password-reset', {
      email,
      success: null,
      error: 'Internal server error',
      password,
      confirmPassword
    });
  }
};
