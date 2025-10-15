const express = require("express");
const {
  createPos,
  updatePos,
  deletePos,
  getPos,
  getallPos,
  loginPos,
  loginGrn,
  getstatus,
} = require("../controller/attenderCtrl");
const { authMiddleware, isAdmin, isAttender } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/loginPos", loginPos);
router.post("/loginGrn", loginGrn);
router.post("/", authMiddleware, isAdmin, createPos);
router.put("/:id", authMiddleware, isAdmin, updatePos);
router.delete("/:id", authMiddleware, isAdmin, deletePos);
router.get("/:id", getPos);
router.get("/",authMiddleware, isAdmin, getallPos);
router.put("/status/:id", authMiddleware, isAdmin, getstatus);

module.exports = router;
