const mongoose = require("mongoose");

const InvoiceSchema = mongoose.Schema(
  {
    invoiceno: { type: String, required: true },
    customerName: { type: String, default: 'user' },
    customerPhoneNumber: { type: Number, default: '9876543210' },
    paymentMethods: [
      {
        method: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ], 
    salestype: { type: String,  required: true },   
    cartItems: { type: Array, required: true },
    cartCount: [
      {
        cartItemsCount: { type: Number, required: true },
        totalItemsQuantity: { type: Number, required: true },
      },
    ], 
    subTotal: { type: Number, required: true },
    groupedTaxSummary: [
    {
    taxRate: { type: String, required: true },
    cgst: { type: Number, required: true },
    sgst: { type: Number, required: true },
    cgstprice: { type: Number, required: true },
    sgstprice: { type: Number, required: true },
    totalTaxAmount: { type: Number, required: true },
      }
       
    ],
    taxprice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },  
    roundOffamount: { type: Number, default: 0 }, 
    GrandtotalAmount: { type: Number, required: true },
    isUpdated: {type: Boolean,default: false},
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "pos",
      required: true 
   },
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model("invoices", InvoiceSchema);

module.exports = Invoice;
