const express = require("express");
const router = express.Router();
const { register, loginAdmin,  logout,  blockUser, unblockUser,handleRefreshToken,updateProfile,} = require("../controller/userctrl"); 
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { checkout, paymentVerification } = require("../controller/paymentCtrl");
const { sendOTP, verifyOTP } = require("../controller/otpCtrl");

// Register route
router.post("/register", register);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
// Login route

router.post("/order/checkout", checkout);
router.post("/order/paymentVerification", paymentVerification);
router.get("/refresh", handleRefreshToken);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);
router.put("/edit-user", authMiddleware, updateProfile);
// Admin Login route
router.post("/admin-login", loginAdmin);
router.get("/logout", logout);
module.exports = router;
