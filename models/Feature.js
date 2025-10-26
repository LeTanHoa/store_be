const mongoose = require("mongoose");

const FeatureSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    type: { type: String, enum: ["mobile", "desktop"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feature", FeatureSchema);
