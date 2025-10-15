const express = require("express");
const {
  createExpance,
  updateExpance,
  deleteExpance,
  getExpance,
  getallExpance,
  getReport,
} = require("../controller/expanceCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

// Static routes should come before dynamic routes
router.get("/getReport",authMiddleware, getReport);

router.post("/", authMiddleware,  createExpance);
router.put("/:id", authMiddleware,  updateExpance);
router.delete("/:id", authMiddleware,  deleteExpance);
router.get("/:id", getExpance);
router.get("/",authMiddleware, getallExpance);

module.exports = router;
