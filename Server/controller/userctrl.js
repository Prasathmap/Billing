const User = require("../models/AdminModel.js");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const { generateRefreshToken, generateToken } = require("../utils/tokenUtils");
const {sendEmail,sendLicenseEmail} = require("./emailCtrl");

// Function to generate a unique license key
const generateLicenseKey = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16).toUpperCase();
  });
};


// Register User
const register = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const phone = req.body.phone;
  
  const findUser = await User.findOne({ $or: [{ email }, { phone }] });
  
  if (!findUser) {
    // Generate License Key
    const licenseKey = generateLicenseKey();
    
    // Create user with license key
    const newUser = await User.create({
      ...req.body,
      licenseKey: licenseKey  // Include the generated license key
    });
    
    // Send License Key via Email
    await sendLicenseEmail(email, licenseKey);
    
    res.status(200).json({ 
      message: "A new user created successfully, and the license key has been sent.",
      user: newUser
    });
  } else {
    throw new Error("User Already Exists");
  }
});


// Admin Login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Check if the user is an admin
  const findAdmin = await User.findOne({ email });
  if (!findAdmin || findAdmin.role !== "admin") {
    return res.status(401).json({ error: "Not Authorized" });
  }
  if (findAdmin.isBlocked) {
    return res.status(403).json({ message: "Blocked" }); // Admin is blocked
  }

  // Check if password matches
  const validPassword = await bcrypt.compare(password, findAdmin.password);
  if (!validPassword) {
    return res.status(403).json({ error: "Invalid Credentials" });
  }

  // Generate tokens
  const refreshToken = await generateRefreshToken(findAdmin._id);
  const updatedUser = await User.findByIdAndUpdate(findAdmin._id, { refreshToken }, { new: true });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 72 * 60 * 60 * 1000, // 72 hours
  });

  res.json({
    _id: findAdmin._id,
    email: findAdmin.email,
    token: generateToken(findAdmin._id),
  });
});
// handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error(" No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

const updateProfile = async (req, res) => {
  try {
    const { id } = req.user; 
    const updateData = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const blockusr = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json(blockusr);
  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User UnBlocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found with this email");
  try {
    const token = await user.createPasswordResetToken();

    await user.save();
    console.log(token);
    const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:3000/reset-password/${token}'>Click Here</>`;

    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      htm: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error(" Token Expired, Please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});


module.exports = {
  register,
  loginAdmin,
  handleRefreshToken,
  blockUser,
  unblockUser,
  forgotPasswordToken,
  resetPassword,
  updateProfile,
  logout,
};
