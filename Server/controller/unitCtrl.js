const Unit = require("../models/unitModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createUnit = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id;
    req.body.createdBy = adminId;
    const newUnit = await Unit.create(req.body);
    res.json(newUnit);
  } catch (error) {
     if (error.code === 11000) {
      return res.status(400).json({ message: " Unit already exists" });
    }
    res.status(500).json({ message: error.message });
    throw new Error(error);
  }
});
const updateUnit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedUnit = await Unit.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedUnit);
  } catch (error) {
    throw new Error(error);
  }
});
const deleteUnit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedUnit = await Unit.findByIdAndDelete(id);
    res.json(deletedUnit);
  } catch (error) {
    throw new Error(error);
  }
});
const getUnit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaUnit = await Unit.findById(id);
    res.json(getaUnit);
  } catch (error) {
    throw new Error(error);
  }
});
const getallUnit = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const getallUnit = await Unit.find({ createdBy: _id }).populate("title");
    res.json(getallUnit);
  } catch (error) {
    throw new Error(error);
  }
});


const getstatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id); 

  try {
    const unit = await Unit.findById(id);
    if (!unit) {
      return res.status(404).json({ message: "unit not found" });
    }

    const updated = await Unit.findByIdAndUpdate(
      id,
      { status: !unit.status }, // ✅ Correct field name
      { new: true }
    );

    res.json({ data: updated });
  } catch (error) {
    console.error("Error toggling unit status:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  createUnit,
  updateUnit,
  deleteUnit,
  getUnit,
  getallUnit,
  getstatus,
};
