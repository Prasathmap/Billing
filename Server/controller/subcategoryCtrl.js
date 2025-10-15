const Subcategory = require("../models/SubcategoryModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createSubcategory = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id;
    req.body.createdBy = adminId;
    const newSubcategory = await Subcategory.create(req.body);
    res.json(newSubcategory);
  } catch (error) {
     if (error.code === 11000) {
      return res.status(400).json({ message: " Subcategory already exists" });
    }
    res.status(500).json({ message: error.message });
    throw new Error(error);
  }
});
const updateSubcategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedSubcategory);
  } catch (error) {
    throw new Error(error);
  }
});
const deleteSubcategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedSubcategory = await Subcategory.findByIdAndDelete(id);
    res.json(deletedSubcategory);
  } catch (error) {
    throw new Error(error);
  }
});
const getSubcategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaSubcategory = await Subcategory.findById(id);
    res.json(getaSubcategory);
  } catch (error) {
    throw new Error(error);
  }
});
const getallSubcategory = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;

    const getallSubcategory = await Subcategory.find({ createdBy: _id }).populate("title");
    res.json(getallSubcategory);
  } catch (error) {
    throw new Error(error);
  }
});

const getstatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id); 

  try {
    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    const updated = await Subcategory.findByIdAndUpdate(
      id,
      { status: !subcategory.status }, // ✅ Correct field name
      { new: true }
    );

    res.json({ data: updated });
  } catch (error) {
    console.error("Error toggling Subcategory status:", error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = {
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getSubcategory,
  getallSubcategory,
  getstatus,
};
