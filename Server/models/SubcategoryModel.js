const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    title: {type: String,required: true,trim: true},
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
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
subcategorySchema.index({ title: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model("Subcategory", subcategorySchema);
