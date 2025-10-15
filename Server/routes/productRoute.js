const express = require("express");
const {
  createProduct,
  getaProduct,
  getAllProduct,
  allProduct,
  updateProduct,
  deleteProduct,
  getstatus,
  updateVariantStatus,
} = require("../controller/productCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createProduct);

router.get("/:id",authMiddleware, getaProduct);

router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.put("/status/:id", authMiddleware, isAdmin, getstatus);
router.put("/:id/variants",authMiddleware,isAdmin, updateVariantStatus);

router.get("/",authMiddleware, getAllProduct);
router.get("/all", allProduct);


module.exports = router;
