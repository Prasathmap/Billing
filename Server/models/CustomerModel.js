const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var customerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
     createdBy: { 
       type: mongoose.Schema.Types.ObjectId, 
       ref: "attender",
       required: true 
     },
  },
  
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("customer", customerSchema);
