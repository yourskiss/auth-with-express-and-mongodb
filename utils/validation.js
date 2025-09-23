// constants/validation.js
export const validateUserInput = (input) => {
  const errorMsg = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;  
  const otpRegex = /^[0-9]\d{5}$/;  

  const { fullname, mobile, email, oldpassword, password, confirmpassword, role, otp } = input;
  const has = (field) => Object.prototype.hasOwnProperty.call(input, field);
 
  // Validate fullname if present
  if (has('fullname') && !fullname) {
    errorMsg.push("Full name is required.");
  }

  // Validate mobile if present
  if (has('mobile')) {
    if (!mobile) {
      errorMsg.push("Mobile number is required.");
    } else if (!mobileRegex.test(mobile)) {
      errorMsg.push("Mobile number must be exactly 10 digits and start with 6-9.");
    }
  }

  // Validate email if present
  if (has('email')) {
    if (!email) {
      errorMsg.push("Email is required.");
    } else if (!emailRegex.test(email)) {
      errorMsg.push("Email format is invalid.");
    }
  }

  
  // Validate oldpassword if present
  if (has('oldpassword')) {
    if (!oldpassword) {
      errorMsg.push("Old Password is required.");
    } else if (!passwordRegex.test(oldpassword)) {
      errorMsg.push("Old Password must be at least 6 characters, must include uppercase, lowercase, number, and special character.");
    }
  }

  // Validate password if present
  if (has('password')) {
    if (!password) {
      errorMsg.push("Password is required.");
    } else if (!passwordRegex.test(password)) {
      errorMsg.push("Password must be at least 6 characters, must include uppercase, lowercase, number, and special character.");
    }
  }

  // Validate confirmPassword if present
  if (has('confirmpassword')) {
    if (!confirmpassword) {
      errorMsg.push("Confirm password is required.");
    } else if (password !== confirmpassword) {
      errorMsg.push("Passwords do not match.");
    }
  }

  // Validate role if present
  if (has('role') && !role) {
    errorMsg.push("Role is required.");
  }

  // Validate OTP if present
  if (has('otp')) {
    if (!otp) {
      errorMsg.push("OTP is required.");
     } else if (!otpRegex.test(otp)) {
      errorMsg.push("OTP must be exactly 6 digits");
    }
  }


  return errorMsg;
};


 
// Login form
//const errorMsg = validateUserInput({ email: req.body.email, password: req.body.password });

// Registration form
// const errorMsg = validateUserInput(req.body); // includes fullname, mobile, email, password, confirmPassword, role

