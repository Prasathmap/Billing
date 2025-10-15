const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getallCategory,
  CategoryStatus,
} = require("../controller/prodcategoryCtrl");
const { authMiddleware, isAdmin,  } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createCategory);
router.put("/:id", authMiddleware, isAdmin, updateCategory);
router.delete("/:id", authMiddleware, isAdmin, deleteCategory);
router.get("/:id", getCategory);
router.get("/",authMiddleware, getallCategory);
router.put("/status/:id",authMiddleware, CategoryStatus);

module.exports = router;
