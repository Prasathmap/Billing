const mongoose = require("mongoose");

const CategorySchema = mongoose.Schema(
  {
    title: { type: String, required: true, index: true ,trim: true},
    status:{ type: Boolean, default: true },
    createdBy: { 
          type: mongoose.Schema.Types.ObjectId,
          ref: "admin", 
          required: true 
    },
  },
  {
    timestamps: true,
  }
);
CategorySchema.index({ title: 1, createdBy: 1 }, { unique: true });
const Category = mongoose.model("productcategories", CategorySchema);

module.exports = Category;
