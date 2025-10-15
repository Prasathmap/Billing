const express = require("express");
const {
  createSalestype,
  updateSalestype,
  deleteSalestype,
  getSalestype,
  getallSalestype,getstatus,
} = require("../controller/salestypeCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createSalestype);
router.put("/:id", authMiddleware, isAdmin, updateSalestype);
router.delete("/:id", authMiddleware, isAdmin, deleteSalestype);
router.get("/:id", getSalestype);
router.get("/",authMiddleware, getallSalestype);
router.put("/status/:id", authMiddleware, isAdmin, getstatus);

module.exports = router;
