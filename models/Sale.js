const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    discountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);
