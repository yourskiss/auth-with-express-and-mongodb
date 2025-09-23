import { sendOtpEmail } from '../utils/sendOTP.js';
import userModels from "../models/userModels.js";
import { hashedPassword, comparePassword } from '../utils/password.js';
import otpGenrater from '../utils/genrateOTP.js';
import { validateUserInput } from '../utils/validation.js';
 
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
  const { fullname, mobile, email, password, confirmpassword } = req.body;
  const data = { fullname, mobile, email, password, confirmpassword }
  const errorMsg = validateUserInput({ fullname:fullname, mobile:mobile, email:email, password:password, confirmpassword:confirmpassword });
  if (errorMsg.length > 0) {
    return res.status(400).render('userview/register', {
      success:null, 
      error:errorMsg.join(", "),
      data,
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
      data: ''
    });
  }
  const data = req.session.tempUser;
  res.status(200).render('userview/register-verify', { 
      success:null, 
      info:null,
      error: null, 
      data
    });
}
 
export const handleVerifyRegister = async (req, res) => {
 if (!req.session.tempUser) {
    return res.status(400).render('userview/register-verify', { 
      success:null, 
      info:'Session Expire. Please resubmit',
      error: null, 
      data: ''
    });
  } 
 const { fullname, mobile, email, password, otpTemp, otpExpiry } = req.session.tempUser;
const data = req.session.tempUser;
 const { otp } = req.body;
 const errorMsg = validateUserInput({ otp: otp });
  if (errorMsg.length > 0) {
    return res.status(400).render('userview/register-verify', {
      success:null, 
      info:null,
      error:errorMsg.join(" "),
      data
    });
  }
  if (new Date(otpExpiry) < new Date()) {
      return res.status(400).render('userview/register-verify', {
        success: null,
        info:null,
        error: 'OTP has expired',
        data
      });
  }
  if (otpTemp !== otp) {
      return res.status(400).render('userview/register-verify', {
        success: null,
        info:null,
        error: 'Invalid OTP',
        data
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
        data
      });
    }

    // temp data session clear
    req.session.tempUser = null; 

    res.status(200).render('userview/register-verify', {
          success:'OTP verified. Registation successfully.',
          info:null,
          error: null,
          data:''
        });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).render('userview/register-verify', {
      success: null,
      info:null,
      error: 'Internal server error',
      data
    });
  }
};


export const renderLogin = async (req, res) => {
  const data = { email:'', password:'' }
  res.render('userview/login', { 
    success:null, 
    error: null, 
    data
  });
}
 
export const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  const data = { email, password }
  const errorMsg = validateUserInput({ email: email, password:password });
  if (errorMsg.length > 0) {
    return res.status(400).render('userview/login', {
      success: null,
      error: errorMsg.join(" "),
      data
    });
  }
  try {
    const result = await userModels.findOne({ email });
    if (!result) {
      return res.status(409).render('userview/login', {
          success:null, 
          error: 'Invalid email id',
          data
        });
    }
    const isMatch = await comparePassword(password, result.password); 
    if (!isMatch) {
      return res.status(409).render('userview/login', {
          success:null, 
          error: 'Invalid password',
          data
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
            data
        });
      }
      console.log("session id - ", req.session.user);
      return res.status(200).render('userview/login', {
          success:'Login successful.', 
          error: null,
          data
      });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).render('userview/login', {
        success:null, 
        error: 'Internal Server Error',
        data
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
  const { email } = req.body;
  const errorMsg = validateUserInput({ email: email });
  if (errorMsg.length > 0) {
    return res.status(400).render('userview/password-forget', {
      error: errorMsg.join(" "),
      email,
      success: null
    });
  }
  try {
    // Check if user exists
    const checkuserbyemail = await userModels.findOne({ email });
    if (!checkuserbyemail) {
      return res.status(409).render('userview/password-forget', {
        error: 'Email not found',
        email,
        success: null
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
  const errorMsg = validateUserInput({ otp: otp });
  if (errorMsg.length > 0) {
    return res.status(400).render('userview/password-otp', {
      success:null, 
      info:null,
      error:errorMsg.join(" "),
      email
    });
  }
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
  const data = { email, password:'', confirmpassword:'' }
  if (!email && !expiretime) {
    return  res.status(400).render('userview/password-reset', {
      success: null,
      info:'Verify your email and OTP first.',
      error: null,
      data
    });
  }
  if (email && !expiretime) {
    return  res.status(400).render('userview/password-reset', {
      success: null,
      info:'Please verify OTP first.',
      error: null,
      data
    });
  }
  res.status(200).render('userview/password-reset', { 
    success:null, 
    info:null,
    error:null,
    data
  });
}; 

export const handlePasswordReset = async (req, res) => {
  const email = req.session.fpStep1;
  const { password, confirmpassword } = req.body;
  const data = { email, password, confirmpassword }
  const errorMsg = validateUserInput({ password: password, confirmpassword:confirmpassword });
  if (errorMsg.length > 0) {
    return res.status(400).render('userview/password-reset', {
      success:null, 
      info:null,
      error:errorMsg.join(" "),
      data
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
        data
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
        success: null,
        info:null,
        error: 'Record not found',
        data
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
      data
    });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).render('userview/password-reset', {
      success: null,
      info:null,
      error: 'Internal server error',
      data
    });
  }
};
