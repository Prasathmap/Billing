const OTP = require("../models/OtpModel");
const User = require("../models/AdminModel");
const asyncHandler = require("express-async-handler");
const { generateOTP, sendEmailOTP } = require("../utils/otpUtils");

// Send OTP
const sendOTP = asyncHandler(async (req, res) => {

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Generate OTPs
    const emailOtp = email ? generateOTP() : null;
   

    // Save OTP to DB (overwrite if exists)
    await OTP.findOneAndUpdate(
      { email },
      { emailOtp, expiresAt: Date.now() + 5 * 60 * 1000 }, // 5 mins expiry
      { upsert: true, new: true }
    );

    // Send OTP via Email/SMS
    if (email) await sendEmailOTP(email, emailOtp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
});

// Verify OTP
const verifyOTP = asyncHandler(async (req, res) => {

  try {
    const {email, emailOtp} = req.body;

    // Find OTP record
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) return res.status(400).json({ message: "OTP not found" });

    // Check expiration
    if (otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Validate OTP
    if ((emailOtp && otpRecord.emailOtp !== emailOtp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP is valid, delete from DB
    await OTP.deleteOne({ email});

    // Update user verification status if needed
    await User.findOneAndUpdate({ email }, { isVerified: true });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
});
module.exports = {
  sendOTP,
  verifyOTP
};
