const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var expanceSchema = new mongoose.Schema({
 category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  createdBy: { 
       type: mongoose.Schema.Types.ObjectId, 
       ref: "attender",
       required: true 
    },
 
},{ timestamps: true });

//Export the model
module.exports = mongoose.model("Expance", expanceSchema);
