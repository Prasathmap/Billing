const User = require("../models/AdminModel");
const Attender = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decoded);
        const user = await User.findById(decoded?.id);
        const attender = await Attender.findById(decoded?.id);
        req.user = user || attender;
        next();
      }
    } catch (error) {
      throw new Error("Not Authorized token expired,Please Login again");
    }
  } else {
    throw new Error("THere is no token attached to header");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  const { _id  } = req.user;
  const adminUser = await User.findOne({ _id });

  if (adminUser.role !== "admin") {
    throw new Error("Your are not an admin");
  } else {
    next();
  }
});

const isAttender = asyncHandler(async (req, res, next) => {
  const { _id  } = req.user;
  const attenderUser = await Attender.findOne({ _id });

  if (attenderUser.role !== "pos" ) {
    throw new Error("Your are not an attender");
  } else {
    next();
  }
});

const isGrn = asyncHandler(async (req, res, next) => {
  const { _id  } = req.user;
  const grnUser = await Attender.findOne({ _id });

  if (grnUser.role !== "grn" ) {
    throw new Error("Your are not an grn");
  } else {
    next();
  }
});

module.exports = { authMiddleware, isAdmin, isAttender,isGrn };
