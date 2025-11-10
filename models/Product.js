const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    images: [String],
    title: String,
    description: String,
    category: String,
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    capacities: [String],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Product", ProductSchema);
