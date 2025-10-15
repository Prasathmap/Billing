const Profile = require("../models/ProfileModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const User = require("../models/UserModel");

const createProfile = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id;
    req.body.createdBy = adminId;
    const newProfile = await Profile.create(req.body);
    res.json(newProfile);
  } catch (error) {
    throw new Error(error);
  }
});
const updateProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedProfile = await Profile.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedProfile);
  } catch (error) {
    throw new Error(error);
  }
});
const deleteProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedProfile = await Profile.findByIdAndDelete(id);
    res.json(deletedProfile);
  } catch (error) {
    throw new Error(error);
  }
});
const getProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaProfile = await Profile.findById(id);
    res.json(getaProfile);
  } catch (error) {
    throw new Error(error);
  }
});
const getallProfile = asyncHandler(async (req, res) => {
  try {
    const { _id, role } = req.user;

    let profile;

    if (role === "admin") {
      profile = await Profile.find({ createdBy: _id });
    } else if (role === "pos") {
      const pos = await User.findById(_id);
      if (!pos) {
        res.status(404);
        throw new Error("Pos not found");
      }

      const adminId = pos.createdBy;
      if (!adminId) {
        res.status(400);
        throw new Error("Pos has no assigned admin");
      }

      profile = await Profile.find({ createdBy: adminId });
    }
    else if (role === "grn") {
      const grn = await User.findById(_id);
      if (!grn) {
        res.status(404);
        throw new Error("grn not found");
      }

      const adminId = grn.createdBy;
      if (!adminId) {
        res.status(400);
        throw new Error("grn has no assigned admin");
      }

      profile = await Profile.find({ createdBy: adminId });
    }
    else {
      res.status(403);
      throw new Error("Unauthorized access");
    }

    res.json(profile);
  } catch (error) {
    console.error("Error in getallCategory:", error);
    res.status(500).json({ message: error.message });
  }
});
module.exports = {
  createProfile,
  updateProfile,
  deleteProfile,
  getProfile,
  getallProfile,
};
