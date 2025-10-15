const Salestype = require("../models/Salestype");
const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createSalestype = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id;
    req.body.createdBy = adminId;
    const newSalestype = await Salestype.create(req.body);
    res.json(newSalestype);
  } catch (error) {
   if (error.code === 11000) {
      return res.status(400).json({ message: "Salestype already exists" });
    }
    res.status(500).json({ message: error.message });
  }
});
const updateSalestype = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedSalestype = await Salestype.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedSalestype);
  } catch (error) {
    throw new Error(error);
  }
});
const deleteSalestype = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedSalestype = await Salestype.findByIdAndDelete(id);
    res.json(deletedSalestype);
  } catch (error) {
    throw new Error(error);
  }
});
const getSalestype = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaSalestype = await Salestype.findById(id);
    res.json(getaSalestype);
  } catch (error) {
    throw new Error(error);
  }
});
const getallSalestype = asyncHandler(async (req, res) => {
  try {
    const { _id, role } = req.user;

    let salestype;

    if (role === "admin") {
      salestype = await Salestype.find({ createdBy: _id }).populate("title");
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

      salestype = await Salestype.find({ createdBy: adminId }).populate("title");
    } else {
      res.status(403);
      throw new Error("Unauthorized access");
    }

    res.json(salestype);
  } catch (error) {
    console.error("Error in getallCategory:", error);
    res.status(500).json({ message: error.message });
  }
});
const getstatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id); 

  try {
    const salestype = await Salestype.findById(id);
    if (!salestype) {
      return res.status(404).json({ message: "salestype not found" });
    }

    const updated = await Salestype.findByIdAndUpdate(
      id,
      { status: !salestype.status }, // ✅ Correct field name
      { new: true }
    );

    res.json({ data: updated });
  } catch (error) {
    console.error("Error toggling salestype status:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  createSalestype,
  updateSalestype,
  deleteSalestype,
  getSalestype,
  getallSalestype,
  getstatus,
};
