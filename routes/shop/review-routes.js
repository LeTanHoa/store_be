const express = require("express");

const {
  addProductReview,
  getProductReviews,
  getAllReviews,
} = require("../../controllers/shop/product-review-controller");

const router = express.Router();

router.post("/add", addProductReview);
router.get("/all", getAllReviews);

router.get("/:productId", getProductReviews);

module.exports = router;
