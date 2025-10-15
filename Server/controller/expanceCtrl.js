const Expance = require("../models/ExpanceModel");
const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const createExpance = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id;
    req.body.createdBy = adminId;
    const newExpance = await Expance.create(req.body);
    res.json(newExpance);
  } catch (error) {
    throw new Error(error);
  }
});
const updateExpance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedExpance = await Expance.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedExpance);
  } catch (error) {
    throw new Error(error);
  }
});
const deleteExpance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletedExpance = await Expance.findByIdAndDelete(id);
    res.json(deletedExpance);
  } catch (error) {
    throw new Error(error);
  }
});
const getExpance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaExpance = await Expance.findById(id);
    res.json(getaExpance);
  } catch (error) {
    throw new Error(error);
  }
});
const getallExpance = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;

    const getallExpance = await Expance.find({ createdBy: _id }).populate("category");
    res.json(getallExpance);
  } catch (error) {
    throw new Error(error);
  }
});

const getReport = asyncHandler(async (req, res) => {
  try {
    const { _id, role } = req.user;

    // Base match conditions for all queries
    let baseMatch = {};

if (role === "admin") {
  // Find all attenders created by this admin
  const attenders = await User.find({ createdBy: _id }).select("_id");
  const attenderIds = attenders.map((attender) => attender._id);

  // Include Expance created by admin and their attenders
  baseMatch.createdBy = { $in: [_id, ...attenderIds] };
} else if (role === "pos") {
  
  baseMatch.createdBy = _id;
} else {
  res.status(403);
  throw new Error("Unauthorized access");
}

    // Get yearly total order data
    const yearlyStartDate = new Date();
    yearlyStartDate.setMonth(yearlyStartDate.getMonth() - 11);
    yearlyStartDate.setDate(1);
    
    const yearlyData = await Expance.aggregate([
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
          amount: 1,
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          amount: { $sum: "$amount" },
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

    const monthWiseData = await Expance.aggregate([
      {
        $match: {
          createdAt: { $gte: monthWiseStartDate, $lte: new Date() },
          ...baseMatch
        },
      },
      {
        $project: {
          month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          amount: 1,
        },
      },
      {
        $group: {
          _id: "$month",
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get today and last 7 days data
    const today = new Date();
    const numberOfDays = 7;
    let expanceData = [];

    for (let i = 0; i < numberOfDays; i++) {
      const currentDate = new Date();
      currentDate.setDate(today.getDate() - i);
      const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

      const dailyData = await Expance.aggregate([
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
            amount: { $sum: "$paymentMethods.amount" },
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
        paymentSummary[payment._id] = payment.amount;
      });

      const totals = await Expance.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay, $lt: endOfDay },
            ...baseMatch
          },
        },
        {
          $group: {
            _id: null,
            amount: { $sum: "$amount" },
            count: { $count: {} },
          },
        },
      ]);

      expanceData.push({
        date: currentDate.toISOString().split("T")[0],
        expances: totals[0]?.amount || 0,
        expanceCount: totals[0]?.count || 0,
        paymentSummary,
      });
    }

    // Combine all data into one response
    res.json({
      yearlyTotalOrders: yearlyData,
      monthWiseOrderIncome: monthWiseData,
      lastSevenDays: expanceData,
    });

  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).send("Server Error");
  }
});


module.exports = {
  createExpance,
  updateExpance,
  deleteExpance,
  getExpance,
  getallExpance,
  getReport,
};
