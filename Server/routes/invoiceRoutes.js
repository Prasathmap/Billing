const express = require("express");
const router = express.Router();
const {
  InvoiceNumber,
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  
  getReport,
} = require("../controller/invoiceCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

// Routes
router.post("/", authMiddleware, createInvoice);
router.get("/bill-no",authMiddleware, InvoiceNumber);
router.get("/sales-report",authMiddleware, getAllInvoices);

// Static routes should come before dynamic routes
router.get("/getReport",authMiddleware, getReport);

// Dynamic routes (like `/:id`) should come after static routes
router.get("/:id",authMiddleware, getInvoiceById);
router.put("/:id", authMiddleware, updateInvoice);
router.delete("/:id",authMiddleware,isAdmin, deleteInvoice);

module.exports = router;