const express = require("express");
const {
    createProfile,
    updateProfile,
    deleteProfile,
    getProfile,
    getallProfile,
} = require("../controller/storeCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProfile);
router.put("/:id", authMiddleware, isAdmin, updateProfile);
router.delete("/:id", authMiddleware, isAdmin, deleteProfile);
router.get("/:id", getProfile);
router.get("/",authMiddleware, getallProfile);

module.exports = router;
