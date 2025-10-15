const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    title: {type: String,required: true,trim: true},
    status:{ type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique brand title per admin
brandSchema.index({ title: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model("Brand", brandSchema);
