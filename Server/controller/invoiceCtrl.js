const Invoice = require("../models/Invoice.js");
const Customer = require("../models/CustomerModel.js")
const User = require("../models/UserModel.js");
const asyncHandler = require("express-async-handler");

// Example helper function
const getNextInvoiceNumber = async (adminId) => {
  const lastInvoice = await Invoice.findOne({ createdBy: adminId })
    .sort({ createdAt: -1 });

  let nextNumber = 1;
  if (lastInvoice && lastInvoice.invoiceno) {
    const match = lastInvoice.invoiceno.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `${String(nextNumber).padStart(4, '0')}`;
};


const InvoiceNumber = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id;
    const invoiceno = await getNextInvoiceNumber(adminId);
    res.status(200).json({ invoiceno });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const createInvoice = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id;
    req.body.createdBy = adminId;

    const invoiceNo = await getNextInvoiceNumber(adminId); // Generate invoice number

    // Save or update customer information
    const { customerName, customerPhoneNumber } = req.body;

    await Customer.findOneAndUpdate(
      { phone: customerPhoneNumber, createdBy: adminId }, // Match by phone and admin
      { title: customerName, phone: customerPhoneNumber, createdBy: adminId }, // Set data
      { upsert: true, new: true, setDefaultsOnInsert: true } // Create if not exist
    );

    // Create new invoice
    const newInvoice = new Invoice({
      ...req.body,
      invoiceno: invoiceNo,
    });

    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


const getAllInvoices = asyncHandler(async (req, res) => {
  try {
    const { _id, role } = req.user;
    let baseMatch = {};

    if (role === "admin") {
      // Get all attenders created by this admin
      const attenders = await User.find({ createdBy: _id }).select("_id");
      const attenderIds = attenders.map((attender) => attender._id);

      // Include invoices created by admin and their attenders
      baseMatch.createdBy = { $in: [_id, ...attenderIds] };
    } else if (role === "pos") {
      baseMatch.createdBy = _id;
    } else {
      res.status(403);
      throw new Error("Unauthorized access");
    }

    // Query invoices using the baseMatch condition
    const invoices = await Invoice.find(baseMatch);

    res.json(invoices);
  } catch (error) {
    console.error("Error in getAllInvoices:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single invoice by ID
const getInvoiceById = asyncHandler(async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an invoice by ID
const updateInvoice = asyncHandler(async (req, res) => {
  try {
    // First find the invoice to check its status
    const existingInvoice = await Invoice.findById(req.params.id);
    
    if (!existingInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    
    if (existingInvoice.isUpdated) {
      return res.status(400).json({ message: "This invoice has already been updated and cannot be modified again" });
    }
    
    // Set isUpdated to true in the update
    const updateData = {
      ...req.body,
      isUpdated: true
    };
    
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.status(200).json(updatedInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Delete an invoice by ID
const deleteInvoice = asyncHandler(async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!deletedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const getReport = asyncHandler(async (req, res) => {
  try {
    const { _id, role } = req.user;

    let baseMatch = {};

    if (role === "admin") {
      // Admin: include self and all attenders they created
      const attenders = await User.find({ createdBy: _id }).select("_id");
      const attenderIds = attenders.map((attender) => attender._id);
    
      baseMatch.createdBy = { $in: [_id, ...attenderIds] };
    
    } else if (role === "pos") {
      // Get the admin who created this attender
      const currentUser = await User.findById(_id).select("createdBy");
    
      if (!currentUser || !currentUser.createdBy) {
        res.status(403);
        throw new Error("Unauthorized access - no parent admin");
      }
    
      const adminId = currentUser.createdBy;
    
      // Find sibling attenders (created by the same admin)
      const siblingAttenders = await User.find({ createdBy: adminId }).select("_id");
      const siblingIds = siblingAttenders.map((att) => att._id);
    
      baseMatch.createdBy = { $in: [adminId, ...siblingIds] };
    
    } else {
      res.status(403);
      throw new Error("Unauthorized access");
    }
    

    // Get yearly total order data
    const yearlyStartDate = new Date();
    yearlyStartDate.setMonth(yearlyStartDate.getMonth() - 11);
    yearlyStartDate.setDate(1);
    
    const yearlyData = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: yearlyStartDate, $lte: new Date() },
          ...baseMatch
        },
      },
      {
        $project: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          GrandtotalAmount: 1,
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          GrandtotalAmount: { $sum: "$GrandtotalAmount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Get month-wise order income
    const monthWiseStartDate = new Date();
    monthWiseStartDate.setMonth(monthWiseStartDate.getMonth() - 11);
    monthWiseStartDate.setDate(1);

    const monthWiseData = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: monthWiseStartDate, $lte: new Date() },
          ...baseMatch
        },
      },
      {
        $project: {
          month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          GrandtotalAmount: 1,
        },
      },
      {
        $group: {
          _id: "$month",
          GrandtotalAmount: { $sum: "$GrandtotalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get today and last 7 days data
    const today = new Date();
    const numberOfDays = 7;
    let earningsData = [];

    for (let i = 0; i < numberOfDays; i++) {
      const currentDate = new Date();
      currentDate.setDate(today.getDate() - i);
      const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

      const dailyData = await Invoice.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lt: endOfDay },
            ...baseMatch
          },
        },
        {
          $unwind: "$paymentMethods",
        },
        {
          $group: {
            _id: "$paymentMethods.method",
            totalAmount: { $sum: "$paymentMethods.amount" },
          },
        },
      ]);

      let paymentSummary = {
        Cash: 0,
        CreditCard: 0,
        OnlinePay: 0,
        Rupay: 0,
      };

      dailyData.forEach((payment) => {
        paymentSummary[payment._id] = payment.totalAmount;
      });

      const totals = await Invoice.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lt: endOfDay },
            ...baseMatch
          },
        },
        {
          $group: {
            _id: null,
            GrandtotalAmount: { $sum: "$GrandtotalAmount" },
            count: { $count: {} },
          },
        },
      ]);

      earningsData.push({
        date: currentDate.toISOString().split("T")[0],
        earnings: totals[0]?.GrandtotalAmount || 0,
        invoiceCount: totals[0]?.count || 0,
        paymentSummary,
      });
    }

    // Combine all data into one response
    res.json({
      yearlyTotalOrders: yearlyData,
      monthWiseOrderIncome: monthWiseData,
      lastSevenDays: earningsData,
    });

  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).send("Server Error");
  }
});




module.exports = {
  InvoiceNumber,
  createInvoice,
  getAllInvoices,
  updateInvoice,
  deleteInvoice,
  getInvoiceById,
  getReport,
};
