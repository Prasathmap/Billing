const express = require("express");
const {
  createExpance,
  updateExpance,
  deleteExpance,
  getExpance,
  getallExpance,getstatus,
} = require("../controller/ExpCatCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createExpance);
router.put("/:id", authMiddleware, isAdmin, updateExpance);
router.delete("/:id", authMiddleware, isAdmin, deleteExpance);
router.get("/:id", getExpance);
router.get("/",authMiddleware, getallExpance);
router.put("/status/:id", authMiddleware, isAdmin, getstatus);

module.exports = router;
