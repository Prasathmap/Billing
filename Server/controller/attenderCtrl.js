const Pos = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const { generateRefreshToken, generateToken } = require("../utils/tokenUtils");
const validateMongoDbId = require("../utils/validateMongodbId");

const createPos = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id;
    req.body.createdBy = adminId;
    const newPos = await Pos.create(req.body);
    
    res.status(201).json(newPos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const updatePos = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedPos = await Pos.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedPos);
  } catch (error) {
    throw new Error(error);
  }
});
const deletePos = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedPos = await Pos.findByIdAndDelete(id);
    res.json(deletedPos);
  } catch (error) {
    throw new Error(error);
  }
});
const getPos = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaPos = await Pos.findById(id);
    res.json(getaPos);
  } catch (error) {
    throw new Error(error);
  }
});
const getallPos = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const pos = await Pos.find({ createdBy: _id }).populate("phone");
    res.json(pos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getstatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id); 

  try {
    const pos = await Pos.findById(id);
    if (!pos) {
      return res.status(404).json({ message: "Pos not found" });
    }

    const updated = await Pos.findByIdAndUpdate(
      id,
      { status: !pos.status }, // ✅ Correct field name
      { new: true }
    );

    res.json({ data: updated });
  } catch (error) {
    console.error("Error toggling Pos status:", error);
    res.status(500).json({ message: error.message });
  }
});

const loginPos = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await Pos.findOne({ phone });
     if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const refreshToken = await generateRefreshToken(user?._id);
    if (user.role !== "pos") {
      return res.status(403).json({ error: "Unauthorized access to POS dashboard" });
    }
     if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password!" });
    }
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: user?._id,
      phone: user?.phone,
      password: user?.password,
      role: user?.role,
      token: generateToken(user?._id),
    });


    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const loginGrn = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await Pos.findOne({ phone });
    const refreshToken = await generateRefreshToken(user?._id);
     if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.role !== "grn") {
      return res.status(403).json({ error: "Unauthorized access to GRN dashboard" });
    }
     if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password!" });
    }
  
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: user?._id,
      phone: user?.phone,
      password: user?.password,
      grn: user?.role,
      token: generateToken(user?._id),
    });

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = {
  createPos,
  updatePos,
  deletePos,
  getPos,
  getallPos,
  loginPos,
  loginGrn,
  getstatus,
};
