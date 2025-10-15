const express = require("express");
const {
  createUnit,
  updateUnit,
  deleteUnit,
  getUnit,
  getallUnit,getstatus,
} = require("../controller/unitCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createUnit);
router.put("/:id", authMiddleware, isAdmin, updateUnit);
router.delete("/:id", authMiddleware, isAdmin, deleteUnit);
router.get("/:id", getUnit);
router.get("/",authMiddleware, isAdmin, getallUnit);
router.put("/status/:id", authMiddleware, isAdmin, getstatus);

module.exports = router;
