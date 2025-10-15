const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var unitSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
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
unitSchema.index({ title: 1, createdBy: 1 }, { unique: true });

//Export the model
module.exports = mongoose.model("Unit", unitSchema);
