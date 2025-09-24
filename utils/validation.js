// utils/validation.js
export const validateUserInput = (input) => {
  const errorMsg = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;  
  const otpRegex = /^[0-9]\d{5}$/;  

  const { fullname, mobile, email, oldpassword, password, confirmpassword, role, otp } = input;
  const has = (field) => Object.prototype.hasOwnProperty.call(input, field);
 
  // Validate fullname if present
  if (has('fullname') && !fullname) {
    errorMsg.fullname = "Full name is required."
  }

  // Validate mobile if present
  if (has('mobile')) {
    if (!mobile) {
      errorMsg.mobile = "Mobile number is required.";
    } else if (!mobileRegex.test(mobile)) {
      errorMsg.mobile = "Mobile number must be exactly 10 digits and start with 6-9.";
    }
  }

  // Validate email if present
  if (has('email')) {
    if (!email) {
      errorMsg.email = "Email is required.";
    } else if (!emailRegex.test(email)) {
      errorMsg.email = "Email format is invalid.";
    }
  }

  
  // Validate oldpassword if present
  if (has('oldpassword')) {
    if (!oldpassword) {
      errorMsg.oldpassword = "Old Password is required.";
    } else if (!passwordRegex.test(oldpassword)) {
      errorMsg.oldpassword = "Old Password must be at least 6 characters, must include uppercase, lowercase, number, and special character.";
    } else if (password === oldpassword) {
      errorMsg.oldpassword = "Old Password and New Password is same. Please try defrant";
    }
  }

  // Validate password if present
  if (has('password')) {
    if (!password) {
      errorMsg.password = "Password is required.";
    } else if (!passwordRegex.test(password)) {
      errorMsg.password = "Password must be at least 6 characters, must include uppercase, lowercase, number, and special character.";
    }
  }

  // Validate confirmPassword if present
  if (has('confirmpassword')) {
    if (!confirmpassword) {
      errorMsg.confirmpassword = "Confirm password is required.";
    } else if (password !== confirmpassword) {
      errorMsg.confirmpassword = "Passwords do not match.";
    }
  }

  // Validate role if present
  if (has('role') && !role) {
    errorMsg.role = "Role is required.";
  }

  // Validate OTP if present
  if (has('otp')) {
    if (!otp) {
      errorMsg.otp = "OTP is required.";
     } else if (!otpRegex.test(otp)) {
      errorMsg.otp = "OTP must be exactly 6 digits";
    }
  }


  return errorMsg;
};

 