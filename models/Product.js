const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    // Descripción técnica del producto
    description: {
      type: String,
      trim: true,
      default: ""
    },

    category: {
      type: String,
      required: true,
      lowercase: true,
      index: true
    },

    gender: {
        type: String,
        enum: ["hombre", "mujer", "niños", "unisex"],
        required: true,
        lowercase: true,
        index: true
    },

     priceWholesale: {
      type: Number,
      required: true,
      min: 0
    },

    priceRetail: {
      type: Number,
      required: true,
      min: 0
    },

     // PRECIO POR TALLE
      pricesBySize: {
      type: Object,
      default: null
      },

    sizes: {
      type: [String],
      default: []
    },

    colors: {
      type: [String],
      default: []
    },

    imagesByColor: {
      type: Object, // { red: [url, url], blue: [url] }
      default: {}
    },

    isNew: {
      type: Boolean,
      default: false
    },

    isPromo: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", productSchema);