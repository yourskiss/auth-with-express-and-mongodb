import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,   // 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  logger: true,
  debug: true,
 // tls: { rejectUnauthorized: false }
});

export const sendOtpEmail = async (to, otp, senderby) => {
  let sub ="";
  if(senderby === "forget") { sub = `${process.env.APP_NAME} : Password Reset OTP`; }
  if(senderby === "register") {sub = `${process.env.APP_NAME} : Registation OTP`; } 

  let msg ="";
  if(senderby === "forget") { msg = `You recently requested to reset your password`; }
  if(senderby === "register") {msg = `You recently requested to registration your email id`; } 
 
  const mailOptions = {
    from: process.env.EMAIL_SENDER, // sender address
    to,
    subject: sub,
   // text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h3 style="color: #333333; text-align: left;">Hi ${to},</h3>
          <p style="font-size: 16px; color: #555555;  text-align: left;"> ${msg}. Use the OTP below to proceed. </p>
          <p style="font-size: 16px; color: #555555;  text-align: left;">This OTP is valid for <strong>${process.env.OTP_TIME} minutes</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; color: #2b2b2b; font-weight: bold; letter-spacing: 4px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #999999;">If you didn't request this, please ignore this email.</p>
          <p style="font-size: 14px; color: #999999;">Regards,<br>${process.env.APP_NAME}</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
