import { sendOtpEmail } from '../utils/sendOTP.js';
import userModels from "../models/userModels.js";
import { hashedPassword, comparePassword } from '../utils/password.js';
import otpGenrater from '../utils/genrateOTP.js';
 
export const renderRegister = async (req, res) => {
  const data = {fullname: '', mobile: '', email: '', password: '', confirmpassword: '' }
  res.render('userview/register', { 
    success:null, 
    error: null, 
    data 
  });
}
 
export const handleRegister = async (req, res) => {
 const { otpTemp, otpExpiry, otpTime } = otpGenrater();
console.log("Register - ", otpTemp, " - ", otpExpiry, " - ", otpTime);

const { fullname, mobile, email, password, confirmpassword } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;  
  const data = { fullname, mobile, email, password, confirmpassword }

  

  if (!fullname || !mobile || !email || !password || !confirmpassword) {
    return res.status(401).render('userview/register', {
          success:null,
          error: 'All fields are required.',
          data
        });
  }
  if (!mobileRegex.test(mobile)) {
    return res.status(401).render('userview/register', {
          success:null,
          error: 'Mobile number must be exactly 10 digits.',
          data
        });
  }
  if (!emailRegex.test(email)) {
    return res.status(401).render('userview/register', {
          success:null,
          error: 'Email format is invalid.',
          data
        });
  } 
  if (!passwordRegex.test(password)) {
    return res.status(401).render('userview/register', {
      success:null,
      error: 'Password must be at least 6 characters, include uppercase, lowercase, number, and special character.',
      data
    });
  }
  if (password !== confirmpassword) {
    return res.status(400).render('userview/register', { 
      success:null,
      error:'Password and confirm password do not match.', 
      data
    });
  }
  // Check if user already exists
    const existingUser = await userModels.findOne({ $or: [{ email }, { mobile }] });
      if (existingUser) {
          const errorMsg = existingUser.email === email
          ? 'Email ID already registered. Register with another Email ID'
          : 'Mobile Number already registered. Try with another Mobile Number';
        return res.status(409).render('userview/register', {
          success: null,
          error: errorMsg,
          data
        });
    }

  try { 
    // ✅ Send OTP email
    await sendOtpEmail(email, otpTemp, "register");  
    console.log(`OTP ${otpTemp} sent to ${email}`);

    // ✅ Store user data + OTP in session
    const newdata = { ...data, otpTemp,  otpExpiry };
    req.session.tempUser = newdata;
    console.log("temp user session - ", newdata)
    req.session.save((err) => {
      if (err) {
        return res.status(405).render('userview/register', {
          success: null,
          error: 'Failed to save session. Try again.',
          data
        });
      }
    });
    res.status(200).render('userview/register', {
          success:`OTP sent to ${email}. It will expire in ${otpTime} minutes.`,
          error: null,
          data 
      });
  } catch (err) {
    console.log("Internal Server Error - ", err)
    res.status(500).render('userview/register', {
          success:null,
          error: 'Internal Server Error. Please try again later.',
          data
        });
  }
};

 

export const renderVerifyRegister = async (req, res) => {
  if (!req.session.tempUser) {
    return res.status(400).render('userview/register-verify', { 
      success:null, 
      info:'Session Expire. Please resubmit',
      error: null, 
      email: ''
    });
  }
  const { email } = req.session.tempUser;
  res.status(200).render('userview/register-verify', { 
      success:null, 
      info:null,
      error: null, 
      email: email
    });
}
 
export const handleVerifyRegister = async (req, res) => {
 if (!req.session.tempUser) {
    return res.status(400).render('userview/register-verify', { 
      success:null, 
      info:'Session Expire. Please resubmit',
      error: null, 
      email: ''
    });
  } 
 const { fullname, mobile, email, password, otpTemp, otpExpiry } = req.session.tempUser;
 const { otp } = req.body;
 
  if (!otp || otp.length !== 6) {
      return res.status(400).render('userview/register-verify', {
        success: null,
        info:null,
        error: 'Enter 6 Digit OTP',
        email
      });
  }
  if (new Date(otpExpiry) < new Date()) {
      return res.status(400).render('userview/register-verify', {
        success: null,
        info:null,
        error: 'OTP has expired',
        email
      });
  }
  if (otpTemp !== otp) {
      return res.status(400).render('userview/register-verify', {
        success: null,
        info:null,
        error: 'Invalid OTP',
        email
      });
  }
 try { 
    let hasshedWithSaltPassword = await hashedPassword(password);
    const finaldata = { fullname, mobile, email, password:hasshedWithSaltPassword, role:'user', otpTemp:null, otpExpiry:null } 
    const result = await userModels.create(finaldata);
    if(!result)
    {
      return res.status(400).render('userview/register-verify', {
        success: null,
        info:null,
        error: 'Error in Registation',
        email
      });
    }
    //console.log("New User register: ", result);
   // console.log("before clear tempUser: ", req.session.tempUser);
    req.session.tempUser = null; // temp data session clear
    console.log("after clear tempUser: ", req.session.tempUser);
    res.status(200).render('userview/register-verify', {
          success:'OTP verified. Registation successfully.',
          info:null,
          error: null,
          email
        });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).render('userview/register-verify', {
      success: null,
      info:null,
      error: 'Internal server error',
      email
    });
  }
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
    const isMatch = await comparePassword(password, result.password); 
    if (!isMatch) {
      return res.status(409).render('userview/login', {
          success:null, 
          error: 'Invalid password',
          email: email
        });
    }
    req.session.user = {
      id: result._id,
      fullname: result.fullname,
      email: result.email,
      role: result.role
    };
   req.session.save(err => {
      if (err) {
        console.error("Session not saved", err);
        res.status(501).render('userview/login', {
            success:null, 
            error: 'Session error',
            email: email
        });
      }
      console.log("session id - ", req.session.user);
      return res.status(200).render('userview/login', {
          success:'Login successful.', 
          error: null,
          email: email
      });
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
  const { otpTemp, otpExpiry, otpTime } = otpGenrater();
  console.log("Password Forget - ", otpTemp, " - ", otpExpiry, " - ", otpTime);
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

 
    // Save OTP and time in DB
    checkuserbyemail.otpTemp = otpTemp;
    checkuserbyemail.otpExpiry = otpExpiry;

    // Update user with OTP details
    await checkuserbyemail.save();  
    console.log(`OTP ${otpTemp} genrated, It will be expire in - ${otpTime} minutes. ===> ${otpExpiry}`);

    // Send OTP to email
    await sendOtpEmail(email, otpTemp, "forget"); 
    console.log(`OTP ${otpTemp} sent to ${email}`);

    // Store email in session
    req.session.fpStep1 = email; 
    console.log(`forgetPassword Session step 1 - ${req.session.fpStep1}`);

    res.status(200).render('userview/password-forget', {  
            success: `OTP sent to ${email}. It will expire in ${otpTime} minutes.`,
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
    if (!user || user.otpTemp !== otp) {
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
    req.session.fpStep2 = user.otpExpiry; 
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
  const expiretime = req.session.fpStep2;
  if (!email && !expiretime) {
    return  res.status(400).render('userview/password-reset', {
      success: null,
      info:'Verify your email and OTP first.',
      error: null,
      email,
      password:'',
      confirmPassword:''
    });
  }
  if (email && !expiretime) {
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
    // check if Entered password is different from Previous password
    const getByEmail = await userModels.findOne({ email });
    const isSame = await comparePassword(password, getByEmail.password);  
    if (isSame) {
      return res.status(409).render('userview/password-reset', {
        success: null,
        info: null,
        error: 'Entered password and Previous password is same. Please enter different password',
        email,
        password:'',
        confirmPassword:''
      });
    }
 
    let hasshedPasswordWithSalt = await hashedPassword(password);
    const user = await userModels.findOneAndUpdate(
      { email },
      { password:hasshedPasswordWithSalt, otpTemp: null, otpExpiry: null },
      { new: true }
    );

    if (!user) {
      return res.status(400).render('userview/password-reset', {
        email,
        success: null,
        info:null,
        error: 'Record not found',
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
