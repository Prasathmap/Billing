// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const logger = require("morgan");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

// ✅ Connect to MongoDB once on server start
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ✅ Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// ✅ Routes
app.get("/", (req, res) => {
  res.status(200).json("Welcome! Server and MongoDB are connected.");
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/pos", require("./routes/posRoute"));
app.use("/api/store", require("./routes/storeRoute"));
app.use("/api/category", require("./routes/categories"));
app.use("/api/subcategory", require("./routes/subcategoryRoute"));
app.use("/api/product", require("./routes/productRoute"));
app.use("/api/salestype", require("./routes/salestypeRoute"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/brand", require("./routes/brandRoute"));
app.use("/api/expcat", require("./routes/expcatRoute"));
app.use("/api/expance", require("./routes/expanceRoute"));
app.use("/api/tax", require("./routes/taxRoute"));
app.use("/api/upload", require("./routes/uploadRoute"));
app.use("/api/unit", require("./routes/unitRoute"));
app.use("/api/coupon", require("./routes/couponRoute"));

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
