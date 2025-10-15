const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {  
      type: String,
      required: true, },
    subcategory: { 
       type: String,
      required: true, },
    brand: { 
      type: String,
      required: true, },
    unit: {
       type: String,
       required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    Producttype: { type: String, enum: ["single", "variable"], required: true },
    Barcode: { type: String, required: function() { return this.Producttype === "single";}  },
    mrp: { type: Number,required: function() { return this.Producttype === "single";} },
    price: { type: Number,required: function() { return this.Producttype === "single";}  },
    tax: { type: Number,required: function() { return this.Producttype === "single";} },
    taxprice: { type: Number, required: function() { return this.Producttype === "single";} },
    cgst: { type: Number,required: function() { return this.Producttype === "single";} },
    cgstprice: { type: Number,required: function() { return this.Producttype === "single";} },
    sgst: { type: Number,required: function() { return this.Producttype === "single";} },
    sgstprice: { type: Number,required: function() { return this.Producttype === "single";} },  
    Quantityalert: { type: Number,required: function() { return this.Producttype === "single";} },    
    variants: [
      {
        variant: { type: String, required: true }, 
        mrp: { type: Number, required: true },
        price: { type: Number, required: true },
        tax: { type: Number, required: true },
        taxprice: { type: Number, required: true },
        cgst: { type: Number, required: true },
        cgstprice: { type: Number, required: true },
        sgst: { type: Number, required: true },
        sgstprice: { type: Number, required: true },
        Quantityalert: { type: Number }, 
        Barcode: { type: String,required: true,unique: true },   
        status: {type: Boolean,default: true },
      },
    ],
     Warranty: { type: String},
     createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
    },
  },

  { timestamps: true }
);


productSchema.index({ title: 1, createdBy: 1 }, { unique: true });
module.exports = mongoose.model("Product", productSchema);
