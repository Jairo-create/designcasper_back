
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },

    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true }
    },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        color: String,
        size: String,
        quantity: Number,

        // precios por unidad
        priceWholesale: Number,
        priceRetail: Number,
        

        // precio real aplicado (mayorista o minorista según cantidad)
        finalUnitPrice: Number,

        subtotal: Number
      }
    ],

    total: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);