const Product = require("../../models/Product");

const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.params;

    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Tuyền tìm kiếm không hợp lệ",
      });
    }

    const regEx = new RegExp(keyword, "i"); // i: không phân biệt hoa/thường
    const query = {
      $or: [
        { title: regEx },
        { description: regEx },
        { category: regEx },
        { brand: regEx },
        { images: regEx },
      ],
    };

    // Tìm kiếm và giới hạn kết quả
    const searchResults = await Product.find(query)
      .limit(50)
      .select("title price images category brand");

    res.status(200).json({
      success: true,
      data: searchResults,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching products",
    });
  }
};

module.exports = { searchProducts };
