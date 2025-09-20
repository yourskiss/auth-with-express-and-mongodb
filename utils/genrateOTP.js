 
const otpGenrater =  () => {
    const time = process.env.OTP_TIME || 10;  

  const otpTemp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpTime = time;   
  const otpExpiry = new Date(Date.now() + time * 60 * 1000);


  return { otpTemp,  otpExpiry, otpTime };
};

export default otpGenrater;