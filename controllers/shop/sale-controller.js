const Product = require("../../models/Product");
const Sale = require("../../models/Sale");

// Tạo sale mới
exports.createSale = async (req, res) => {
  const { name, products, discountPercent, startDate, endDate } = req.body;

  try {
    const existingSale = await Sale.findOne();
    if (existingSale) {
      return res.status(400).json({
        message: "Chỉ được phép tạo duy nhất 1 chương trình khuyến mãi.",
      });
    }

    const sale = await Sale.create({
      name,
      products,
      discountPercent,
      startDate,
      endDate,
    });

    for (const productId of products) {
      const product = await Product.findById(productId);
      if (product) {
        const salePrice = Math.round(
          product.price * (1 - discountPercent / 100)
        );
        await Product.findByIdAndUpdate(productId, { salePrice });
      }
    }

    res.json({
      message: "Tạo chương trình giảm giá thành công.",
      sale,
    });
  } catch (err) {
    console.error("❌ Lỗi khi tạo sale:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate("products");
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate("products");
    res.json(sale);
  } catch (err) {
    res.status(404).json({ message: "Sale not found" });
  }
};

// Update sale
exports.updateSale = async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(sale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete sale
exports.deleteSale = async (req, res) => {
  try {
    // 1️⃣ Tìm sale trước khi xóa để biết sản phẩm nào đang được giảm giá
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy chương trình giảm giá." });
    }

    // 2️⃣ Lấy danh sách sản phẩm trong chương trình sale
    const productIds = sale.products;

    // 3️⃣ Đặt lại salePrice về null cho các sản phẩm đó
    for (const productId of productIds) {
      await Product.findByIdAndUpdate(productId, { $unset: { salePrice: "" } });
      // hoặc: await Product.findByIdAndUpdate(productId, { salePrice: null });
    }

    // 4️⃣ Xóa chương trình giảm giá
    await Sale.findByIdAndDelete(req.params.id);

    // 5️⃣ Trả phản hồi thành công
    res.json({
      message:
        "Xóa chương trình giảm giá thành công, giá sản phẩm đã trở lại bình thường.",
    });
  } catch (err) {
    console.error("❌ Lỗi khi xóa sale:", err);
    res.status(400).json({ message: err.message });
  }
};
