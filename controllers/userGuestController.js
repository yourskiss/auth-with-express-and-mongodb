import { sendOtpEmail } from '../utils/sendOTP.js';
import userModels from "../models/userModels.js";
import { hashedPassword, comparePassword } from '../utils/password.js';
import otpGenrater from '../utils/genrateOTP.js';
import { validateUserInput } from '../utils/validation.js';
import { 
   returnRegister, returnVR, returnLogin, returnPF, returnPasswordOTP, returnPR
} from "../utils/renderHandler.js";
 
export const renderRegister = async (req, res) => {
  const data = {fullname: '', mobile: '', email: '', password: '', confirmpassword: '' }
    return returnRegister({ 
        res, 
        status:201, 
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
    return returnRegister({ 
        res, 
        status:200, 
        view: 'register', 
        success:`OTP sent to ${email}. It will expire in ${otpTime} minutes.`,
        error:null, 
        data
    });
  } catch (err) {
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
    return returnVR({ 
        res, 
        status:400, 
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
  if (!req.session.tempUser) {
    return returnVR({ 
        res, 
        status:400, 
        view: 'register-verify', 
        success: null, 
        info:'Session Expire. Please resubmit',
        error:null,
        data:''
    });
  } 
 const { fullname, mobile, email, password, otpTemp, otpExpiry } = req.session.tempUser;
 const data = req.session.tempUser;
 const { otp } = req.body;
 const errorMsg = await validateUserInput({ otp: otp });
  if (Object.keys(errorMsg).length > 0) {
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
      return returnVR({ 
        res, 
        status:400, 
        view: 'register-verify', 
        success: null, 
        info:null,
         error: 'Error in Registation',
        data
      });
    }

    // temp data session clear
    req.session.tempUser = null; 

    return returnVR({ 
        res, 
        status:200, 
        view: 'register-verify', 
        success:'OTP verified. Registation successfully.',
        info:null,
        error:null,
        data:''
    });

  } catch (err) {
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
        status:201, 
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
      return returnLogin({ 
        res, 
        status:409, 
        view: 'login', 
        success: null, 
        error: 'Invalid email id',
        data
      });
    }
    const isMatch = await comparePassword(password, result.password); 
    if (!isMatch) {
      return returnLogin({ 
        res, 
        status:409, 
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
        return returnLogin({ 
            res, 
            status:501, 
            view: 'login', 
            success: null, 
            error: 'Session not created.',
            data
        });
      }
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
        status:201, 
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
 
    return returnPF({ 
        res, 
        status:200, 
        view: 'password-forget', 
        success: `OTP sent to ${email}. It will expire in ${otpTime} minutes.`,
        error: null,
        email
    });
  } catch (err) {
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
    return returnPasswordOTP({ 
        res, 
        status:400, 
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
      return returnPasswordOTP({ 
        res, 
        status:400, 
        view: 'password-otp', 
        success: null, 
        info: null,
        error: 'Invalid OTP',
        email
      });
    } 
    if (user.otpExpiry < new Date()) {
      return returnPasswordOTP({ 
        res, 
        status:400, 
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
      return returnPR({ 
        res, 
        status:400, 
        view: 'password-reset', 
        success: null, 
        info:'Verify your email and OTP first.',
        error: null,
        data
      });
  }
  if (email && !expiretime) {
      return returnPR({ 
        res, 
        status:400, 
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
      return returnPR({ 
        res, 
        status:400, 
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
