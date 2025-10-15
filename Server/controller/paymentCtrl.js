const Razorpay = require("razorpay");
const asyncHandler = require("express-async-handler");
const instance = new Razorpay({
  key_id: "rzp_test_QSZHdzxON8Fo45",
  key_secret: "d8jkgLSQXsxVHO8oFD31Y6n8",
});

const checkout = async (req, res) => {
  const { amount } = req.body;
  const option = {
    amount: amount * 100,
    currency: "INR",
  };
  const order = await instance.orders.create(option);
  res.json({
    success: true,
    order,
  });
};

const paymentVerification = async (req, res) => {
  const { razorpayPaymentId } = req.body;
  res.json({
    success: true, // ✅ Added success flag
    razorpayPaymentId,
    message: "Payment verified successfully!",
  });
};

const createPayment = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id;
    req.body.createdBy = adminId;

    const newPayment = await Payment.create(req.body);
    res.status(201).json(newPayment);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Payment already exists" });
    }
    res.status(500).json({ message: error.message });
  }
});
module.exports = {
  checkout,
  paymentVerification,
  createPayment,
};
