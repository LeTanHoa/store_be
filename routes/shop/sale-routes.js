const express = require("express");
const {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
} = require("../../controllers/shop/sale-controller");

const router = express.Router();

router.post("/", createSale);
router.get("/", getAllSales);
router.get("/:id", getSaleById);
router.put("/:id", updateSale);
router.delete("/:id", deleteSale);

module.exports = router;
