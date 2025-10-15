const nodemailer = require("nodemailer");

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendEmailOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your OTP Code</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body style="margin: 0; font-family: 'Poppins', sans-serif; background: #ffffff; font-size: 14px;">
    <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff; text-align: center;">
      <h1 style="font-size: 24px; font-weight: 500; color: #1f1f1f;">Your OTP</h1>
      <p style="font-size: 16px; font-weight: 500;">Hello,</p>
      <p style="font-weight: 500;">Thank you for choosing our service. Use the following OTP to complete your verification. The OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
      <p style="margin-top: 20px; font-size: 40px; font-weight: 600; letter-spacing: 10px; color: #ba3d4f;">${otp}</p>
      <p style="margin-top: 40px; font-size: 14px; color: #8c8c8c;">Need help? Contact us at <a href="mailto:support@example.com" style="color: #499fb6; text-decoration: none;">support@example.com</a></p>
    </div>
  </body>
</html>`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {sendEmailOTP, generateOTP};
