const express = require("express");
const {
  createTax,
  updateTax,
  deleteTax,
  getTax,
  getallTax,
  getstatus,
} = require("../controller/taxCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createTax);
router.put("/:id", authMiddleware, isAdmin, updateTax);
router.delete("/:id", authMiddleware, isAdmin, deleteTax);
router.get("/:id", getTax);
router.get("/",authMiddleware, isAdmin, getallTax);
router.put("/status/:id", authMiddleware, isAdmin, getstatus);

module.exports = router;
