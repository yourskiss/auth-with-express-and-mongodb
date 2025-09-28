import { sendOtpEmail } from '../utils/sendOTP.js';
import userModels from "../models/userModels.js";
import { hashedPassword, comparePassword } from '../utils/password.js';
import otpGenrater from '../utils/genrateOTP.js';
import { validateUserInput } from '../utils/validation.js';
import { wlogs } from '../utils/winstonLogger.js'; // logger
import { 
   returnRegister, returnVR, returnLogin, returnPF, returnPasswordOTP, returnPR
} from "../utils/renderHandler.js"; // retun handler



export const renderRegister = async (req, res) => {
  const data = {fullname: '', mobile: '', email: '', password: '', confirmpassword: '' }
    return returnRegister({ 
        res, 
        status:200, 
        view: 'register', 
        success: null, 
        error:null, 
        data
    });
}
 
export const handleRegister = async (req, res) => {
  const { otpTemp, otpExpiry, otpTime } = otpGenrater();
  const { fullname, mobile, email, password, confirmpassword } = req.body;
  const data = { fullname, mobile, email, password, confirmpassword }
  const errorMsg = await validateUserInput({ fullname:fullname, mobile:mobile, email:email, password:password, confirmpassword:confirmpassword });
  // if (errorMsg.length > 0) {
  if (Object.keys(errorMsg).length > 0) {
    wlogs(req, 'error', 'Registation - Invalid Input',  400);
    return returnRegister({ 
        res, 
        status:400, 
        view: 'register', 
        success: null, 
        error:errorMsg,
        data
    });
  }

  // Check if user already exists
  const existingUser = await userModels.findOne({ $or: [{ email }, { mobile }] });
  if (existingUser) {
        const errorMsg = existingUser.email === email ? 'Email ID already registered. Register with another Email ID' : 'Mobile Number already registered. Try with another Mobile Number';
  
        wlogs(req, 'error', `Registation - ${existingUser.email === email ? 'Email' : 'Mobile'} Already Exists`,  409);
        return res.status(409).render('userview/register', {
          success: null,
          error: errorMsg,
          data
        });
  }
  try { 
    // ✅ Send OTP email
    await sendOtpEmail(email, otpTemp, "register");  
 
    // ✅ Store user data + OTP in session
    const newdata = { ...data, otpTemp,  otpExpiry };
    req.session.tempUser = newdata;
    console.log("temp user session - ", newdata)

    req.session.save((err) => {
      if (err) {
        wlogs(req, 'error', 'Registation - Session issue',  422);
        return returnRegister({ 
          res, 
          status:405, 
          view: 'register', 
          success: null, 
          error: 'Failed to save session. Try again.',
          data
        });
      }
    });
    wlogs(req, 'info', 'Registation - OTP sent',  200);
    return returnRegister({ 
        res, 
        status:200, 
        view: 'register', 
        success:`OTP sent to ${email}. It will expire in ${otpTime} minutes.`,
        error:null, 
        data
    });
  } catch (err) {
    wlogs(req, 'error', 'Registation - Internal Server Error', 500);
    return returnRegister({ 
        res, 
        status:500, 
        view: 'register', 
        success: null, 
         error: 'Internal Server Error. Please try again later.',
        data
    });
  }
};

 

export const renderVerifyRegister = async (req, res) => {
  if (!req.session.tempUser) {
    wlogs(req, 'error', 'Verify Registation - Session Issue',  302);
    return returnVR({ 
        res, 
        status:302, 
        view: 'register-verify', 
        success: null, 
        info:'Session Expire. Please resubmit',
        error:null,
        data:null
    });
  }
  const data = req.session.tempUser;
    return returnVR({ 
        res, 
        status:200, 
        view: 'register-verify', 
        success: null, 
        info:null,
        error:null,
        data
    });
}
 
export const handleVerifyRegister = async (req, res) => {
 const { fullname, mobile, email, password, otpTemp, otpExpiry } = req.session.tempUser;
 const data = req.session.tempUser;
 const { otp } = req.body;
 const errorMsg = await validateUserInput({ otp: otp });
  if (Object.keys(errorMsg).length > 0) {
    wlogs(req, 'error', 'Verify Registation - - Invalid Input',  400);
    return returnVR({ 
        res, 
        status:400, 
        view: 'register-verify', 
        success: null, 
        info:null,
        error:errorMsg,
        data
    });
  }
  if (new Date(otpExpiry) < new Date()) {
    wlogs(req, 'error', 'Verify Registation - OTP has expired',  400);
    return returnVR({ 
        res, 
        status:400, 
        view: 'register-verify', 
        success: null, 
        info:'OTP has expired, Please try again.',
        error: null,
        data
    });
  }
  if (otpTemp !== otp) {
    wlogs(req, 'error', 'Verify Registation - Invalid OTP',  400);
    return returnVR({ 
        res, 
        status:400, 
        view: 'register-verify', 
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
      wlogs(req, 'warn', 'Verify Registation - Error',  404);
      return returnVR({ 
        res, 
        status:404, 
        view: 'register-verify', 
        success: null, 
        info:null,
         error: 'Error in Registation',
        data
      });
    }

    // temp data session clear
    req.session.tempUser = null; 

    wlogs(req, 'info', 'Verify Registation - Successfully', 201 );
    return returnVR({ 
        res, 
        status:201, 
        view: 'register-verify', 
        success:'OTP verified. Registation successfully.',
        info:null,
        error:null,
        data
    });

  } catch (err) {
    wlogs(req, 'error', 'Verify Registation - Internal server error',  500);
    return returnVR({ 
        res, 
        status:500, 
        view: 'register-verify', 
        success: null, 
        info:null,
        error: 'Internal server error',
        data
    });
  }
};


export const renderLogin = async (req, res) => {
  const data = { email:'', password:'' }
  return returnLogin({ 
        res, 
        status:200, 
        view: 'login', 
        success: null, 
        error:null, 
        data
  });
}
 
export const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  const data = { email, password }
  const errorMsg = await validateUserInput({ email: email, password:password });
  if (Object.keys(errorMsg).length > 0) {
    wlogs(req, 'error', 'Login - Invalid Input', 400 );
    return returnLogin({ 
        res, 
        status:400, 
        view: 'login', 
        success: null, 
        error: errorMsg,
        data
    });
  }
  try {
    const result = await userModels.findOne({ email });
    if (!result) {
      wlogs(req, 'warn', 'Login - Invalid Email ID', 404 );
      return returnLogin({ 
        res, 
        status:404, 
        view: 'login', 
        success: null, 
        error: 'Invalid email id',
        data
      });
    }
    const isMatch = await comparePassword(password, result.password); 
    if (!isMatch) {
      wlogs(req, 'warn', 'Login - Invalid Password', 404 );
      return returnLogin({ 
        res, 
        status:404, 
        view: 'login', 
        success: null, 
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
        wlogs(req, 'error', 'Login - Session Issue', 422 );
        return returnLogin({ 
            res, 
            status:422, 
            view: 'login', 
            success: null, 
            error: 'Session not created.',
            data
        });
      }
      wlogs(req, 'info', 'Login - Successful', 200 );
      return returnLogin({ 
        res, 
        status:200, 
        view: 'login', 
        success:'Login successful.', 
        error:null, 
        data
      });
    });
  } catch (err) {
    wlogs(req, 'error', 'Login - Internal Server Error', 500 );
    return returnLogin({ 
        res, 
        status:500, 
        view: 'login', 
        success: null, 
        error: 'Internal Server Error',
        data
    });
  }
};



export const renderPasswordForget = (req, res) => {
  return returnPF({ 
        res, 
        status:200, 
        view: 'password-forget', 
        success: null, 
        error: null,
        email:''
  });
};  
export const handlePasswordForget = async (req, res) => {
  const { otpTemp, otpExpiry, otpTime } = otpGenrater();
  const { email } = req.body;
  const errorMsg = await validateUserInput({ email: email });
  if (Object.keys(errorMsg).length > 0) {
    wlogs(req, 'error', 'Password Forget - Invalid Input',  400);
    return returnPF({ 
        res, 
        status:400, 
        view: 'password-forget', 
        success: null, 
        error: errorMsg,
        email
    });
  }
  try {
    // Check if user exists
    const checkuserbyemail = await userModels.findOne({ email });
    if (!checkuserbyemail) {
      wlogs(req, 'warn', 'Password Forget - Email not found',  409);
      return returnPF({ 
        res, 
        status:409, 
        view: 'password-forget', 
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
 
    // Send OTP to email
    await sendOtpEmail(email, otpTemp, "forget"); 
    console.log(`OTP ${otpTemp} sent to ${email}. It will expire in ${otpTime} minutes.`)
 
    // Store email in session
    req.session.fpStep1 = email; 
 
    wlogs(req, 'info', 'Password Forget - OTP sent',  200);
    return returnPF({ 
        res, 
        status:200, 
        view: 'password-forget', 
        success: `OTP sent to ${email}. It will expire in ${otpTime} minutes.`,
        error: null,
        email
    });
  } catch (err) {
    wlogs(req, 'error', 'Password Forget - Internal server error',  500);
    return returnPF({ 
        res, 
        status:500, 
        view: 'password-forget', 
        success: null, 
        error: 'Internal server error',
        email
    });
  }
};



export const renderPasswordOtp  = (req, res) => {
  const email = req.session.fpStep1;
  if (!email) {
    wlogs(req, 'error', 'Verify Password - Verify email first.',  302);
    return returnPasswordOTP({ 
        res, 
        status:302, 
        view: 'password-otp', 
        success: null, 
        info:'Verify your email first.',
        error: null,
        email
    });
  }
  return returnPasswordOTP({ 
        res, 
        status:200, 
        view: 'password-otp', 
        success: null, 
        info: null,
        error: null,
        email
  });
}; 


export const handlePasswordOtp = async (req, res) => {
  const { otp } = req.body;
  const email = req.session.fpStep1;
  const errorMsg = await validateUserInput({ otp: otp });
  if (Object.keys(errorMsg).length > 0) {
    wlogs(req, 'error', 'Verify Password - Invalid Input',  400);
    return returnPasswordOTP({ 
        res, 
        status:400, 
        view: 'password-otp', 
        success: null, 
        info: null,
        error:errorMsg,
        email
    });
  }
  try {
    const user = await userModels.findOne({ email });
    if (!user || user.otpTemp !== otp) {
      wlogs(req, 'error', 'Verify Password - Invalid OTP',  422);
      return returnPasswordOTP({ 
        res, 
        status:422, 
        view: 'password-otp', 
        success: null, 
        info: null,
        error: 'Invalid OTP',
        email
      });
    } 
    if (user.otpExpiry < new Date()) {
      wlogs(req, 'error', 'Verify Password - OTP Expired',  422);
      return returnPasswordOTP({ 
        res, 
        status:422, 
        view: 'password-otp', 
        success: null, 
        info: 'OTP has expired, Please try again.',
        error: null,
        email
      });
    }

    // Store verifyOTP in session
    req.session.fpStep2 = user.otpExpiry; 

    

    // OTP verified successfully
    wlogs(req, 'info', 'Verify Password - OTP Verified',  200);
    return returnPasswordOTP({ 
        res, 
        status:200, 
        view: 'password-otp', 
        success: 'OTP verified. You can now reset your password.',
        info: null,
        error: null,
        email
    });
  } catch (err) {
    wlogs(req, 'info', 'Verify Password - Internal server error',  500);
    return returnPasswordOTP({ 
        res, 
        status:500, 
        view: 'password-otp', 
        success: null, 
        info: null,
        error: 'Internal server error',
        email
    });
  }
};


      

export const renderPasswordReset = (req, res) => {
  const email = req.session.fpStep1;
  const expiretime = req.session.fpStep2;
  const data = { email, password:'', confirmpassword:'' }
  if (!email && !expiretime) {
      wlogs(req, 'error', 'Reset Password - Verify email and OTP',  302);
      return returnPR({ 
        res, 
        status:302, 
        view: 'password-reset', 
        success: null, 
        info:'Verify your email and OTP first.',
        error: null,
        data
      });
  }
  if (email && !expiretime) {
      wlogs(req, 'error', 'Reset Password - Verify OTP',  302);
      return returnPR({ 
        res, 
        status:302, 
        view: 'password-reset', 
        success: null, 
        info:'Please verify OTP first.',
        error: null,
        data
      });
  }
      return returnPR({ 
        res, 
        status:200, 
        view: 'password-reset', 
        success: null, 
        info: null,
        error: null,
        data
      });
}; 

export const handlePasswordReset = async (req, res) => {
  const email = req.session.fpStep1;
  const { password, confirmpassword } = req.body;
  const data = { email, password, confirmpassword }
  const errorMsg = await validateUserInput({ password: password, confirmpassword:confirmpassword });
  if (Object.keys(errorMsg).length > 0) {
      wlogs(req, 'error', 'Reset Password - Invalid Input',  400);
      return returnPR({ 
        res, 
        status:400, 
        view: 'password-reset', 
        success: null, 
        info: null,
        error:errorMsg,
        data
      });
  }
  try {
    // check if Entered password is different from Previous password
    const getByEmail = await userModels.findOne({ email });
    const isSame = await comparePassword(password, getByEmail.password);  
    if (isSame) {
      wlogs(req, 'error', 'Reset Password - Same Password ',  409);
      return returnPR({ 
        res, 
        status:409, 
        view: 'password-reset', 
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
      wlogs(req, 'warn', 'Reset Password - Not Found',  204);
      return returnPR({ 
        res, 
        status:204, 
        view: 'password-reset', 
        success: null, 
        info: null,
        error: 'Record not found',
        data
      });
    }
    // Clear session data related to password reset
    req.session.fpStep1 = null;
    req.session.fpStep2 = null;

      wlogs(req, 'info', 'Reset Password - Reset Successfully',  200);
      return returnPR({ 
        res, 
        status:200, 
        view: 'password-reset', 
        success: 'Password reset successfully! You can now log in.',
        info: null,
        error: null,
        data
      });
  } catch (err) {
    wlogs(req, 'info', 'Reset Password - Internal server error',  500);
    return returnPR({ 
        res, 
        status:500, 
        view: 'password-reset', 
        success: null, 
        info: null,
        error: 'Internal server error',
        data
      });
  }
};
