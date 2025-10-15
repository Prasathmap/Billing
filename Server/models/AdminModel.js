const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const AdminSchema = mongoose.Schema(
  {
    userName: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      unique: true,
      required: true
     }, 
    phone: { 
      type: String, 
      required: true, 
      unique: true,
    },
    password: { 
      type: String, 
      required: true 
    },  
    isBlocked: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "admin",
    },
    paymentInfo: {
      razorpayPaymentId: {
        type: String,
        required: true,
      },
    },

    licenseKey: { type: String, unique: true },
    isVerified: { type: Boolean, default: false }, // User verification after successful payment
  },

  {
    timestamps: true,
  }
);

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
AdminSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
AdminSchema.methods.createPasswordResetToken = async function () {
  const resettoken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resettoken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 minutes
  return resettoken;
};
const Admin = mongoose.model("admin", AdminSchema);

module.exports = Admin;