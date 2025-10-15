const Expance = require("../models/ExpCatModel");
const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createExpance = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id;
    req.body.createdBy = adminId;
    const newExpance = await Expance.create(req.body);
    res.json(newExpance);
  } catch (error) {
     if (error.code === 11000) {
      return res.status(400).json({ message: "Expance category already exists" });
    }
    res.status(500).json({ message: error.message });
  }
});
const updateExpance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedExpance = await Expance.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedExpance);
  } catch (error) {
    throw new Error(error);
  }
});
const deleteExpance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedExpance = await Expance.findByIdAndDelete(id);
    res.json(deletedExpance);
  } catch (error) {
    throw new Error(error);
  }
});
const getExpance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaExpance = await Expance.findById(id);
    res.json(getaExpance);
  } catch (error) {
    throw new Error(error);
  }
});
const getallExpance = asyncHandler(async (req, res) => {
  try {
    const { _id, role } = req.user;

    let expancecategories;

    if (role === "admin") {
      expancecategories = await Expance.find({ createdBy: _id }).populate("title");
    } else if (role === "pos") {
      const pos = await User.findById(_id);
      if (!pos) {
        res.status(404);
        throw new Error("pos not found");
      }

      const adminId = pos.createdBy;
      if (!adminId) {
        res.status(400);
        throw new Error("pos has no assigned admin");
      }

      expancecategories = await Expance.find({ createdBy: adminId }).populate("title");
    } else {
      res.status(403);
      throw new Error("Unauthorized access");
    }

    res.json(expancecategories);
  } catch (error) {
    console.error("Error in getallExpance:", error);
    res.status(500).json({ message: error.message });
  }
});
const getstatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id); 

  try {
    const expance = await Expance.findById(id);
    if (!expance) {
      return res.status(404).json({ message: "expance not found" });
    }

    const updated = await Expance.findByIdAndUpdate(
      id,
      { status: !expance.status }, // ✅ Correct field name
      { new: true }
    );

    res.json({ data: updated });
  } catch (error) {
    console.error("Error toggling expance status:", error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = {
  createExpance,
  updateExpance,
  deleteExpance,
  getExpance,
  getallExpance,
  getstatus,
};
