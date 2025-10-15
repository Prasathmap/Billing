const Tax = require("../models/taxModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createTax = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id;
    req.body.createdBy = adminId;
    const newTax = await Tax.create(req.body);
    res.json(newTax);
  } catch (error) {
     if (error.code === 11000) {
      return res.status(400).json({ message: " Tax already exists" });
    }
    res.status(500).json({ message: error.message });
    throw new Error(error);
  }
});
const updateTax = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedTax = await Tax.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedTax);
  } catch (error) {
    throw new Error(error);
  }
});
const deleteTax = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedTax = await Tax.findByIdAndDelete(id);
    res.json(deletedTax);
  } catch (error) {
    throw new Error(error);
  }
});
const getTax = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaTax = await Tax.findById(id);
    res.json(getaTax);
  } catch (error) {
    throw new Error(error);
  }
});
const getallTax = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;

    const getallTax = await Tax.find({ createdBy: _id }).populate("title");
    res.json(getallTax);
  } catch (error) {
    throw new Error(error);
  }
});

const getstatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id); 

  try {
    const tax = await Tax.findById(id);
    if (!tax) {
      return res.status(404).json({ message: "tax not found" });
    }

    const updated = await Tax.findByIdAndUpdate(
      id,
      { status: !tax.status }, // ✅ Correct field name
      { new: true }
    );

    res.json({ data: updated });
  } catch (error) {
    console.error("Error toggling tax status:", error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = {
  createTax,
  updateTax,
  deleteTax,
  getTax,
  getallTax,
  getstatus,
};
