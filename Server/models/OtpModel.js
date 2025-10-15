const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: false },
  emailOtp: { type: String, required: false },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("OTP", otpSchema);
