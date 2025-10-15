const Category = require("../models/Category");
const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createCategory = asyncHandler(async (req, res) => {
  try {
    const { title } = req.body;
    const createdBy = req.user._id;
    const newCategory = await Category.create({
      title,
      createdBy,
    });

    res.json(newCategory);
  } catch (error) {
     if (error.code === 11000) {
      return res.status(400).json({ message: " Category already exists" });
    }
    res.status(500).json({ message: error.message });
  }
});


const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const { title } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );

    res.json(updatedCategory);
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
});


// Delete a category
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deletedCategory = await Category.findByIdAndDelete(id);
    res.json(deletedCategory);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// Get a single category by ID
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const getaCategory = await Category.findById(id);
    res.json(getaCategory);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// Get all categories
const getallCategory = asyncHandler(async (req, res) => {
  try {
    const { _id, role } = req.user;

    let categories;

    if (role === "admin") {
      categories = await Category.find({ createdBy: _id }).populate("title");
    } else if (role === "pos") {
      const pos = await User.findById(_id);
      if (!pos) {
        res.status(404);
        throw new Error("Pos  Login not found");
      }

      const adminId = pos.createdBy;
      if (!adminId) {
        res.status(400);
        throw new Error("Pos has no assigned admin");
      }

      categories = await Category.find({ createdBy: adminId }).populate("title");
    }
    else if (role === "grn") {
      const grn = await User.findById(_id);
      if (!grn) {
        res.status(404);
        throw new Error("GRN  Login not found");
      }

      const adminId =grn.createdBy;
      if (!adminId) {
        res.status(400);
        throw new Error("GRN has no assigned admin");
      }

      categories = await Category.find({ createdBy: adminId }).populate("title");
    }
     else {
      res.status(403);
      throw new Error("Unauthorized access");
    }

    res.json(categories);
  } catch (error) {
    console.error("Error in getallCategory:", error);
    res.status(500).json({ message: error.message });
  }
});

const CategoryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const updated = await Category.findByIdAndUpdate(
    id,
    { status: !category.status },
    { new: true }
  );

  res.json({ data: updated });
});




module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
  CategoryStatus
};
