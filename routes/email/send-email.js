const express = require("express");
const transporter = require("../../helpers/emailTransporter");
const User = require("../../models/User");
const router = express.Router();

router.post("/send-mail-register", async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin",
    });
  }

  const mailOptions = {
    from: `Store`,
    subject: "Đăng ký thành công vào hệ thống Store",

    to: email,
    html: `
       <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); padding: 20px;">
      <h2 style="color: #2b4eff; text-align: center;">Chào mừng bạn đến với Store! 🎉</h2>
      <p>Xin chào <strong>${name}</strong>,</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Store</strong>. Tài khoản của bạn đã được tạo thành công.</p>
      <p>Bây giờ bạn có thể đăng nhập để trải nghiệm các sản phẩm và dịch vụ tốt nhất của chúng tôi.</p>

      <p>Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi để được hỗ trợ.</p>

      <hr style="margin: 20px 0;" />
      <p style="font-size: 12px; color: #666; text-align: center;">
        Email này được gửi tự động từ hệ thống Store.<br/>
        Vui lòng không trả lời email này.
      </p>
    </div>
  </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);

    res.json({
      success: true,
      message: "Email sent successfully!",
    });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email.",
      error: error.message,
    });
  }
});

router.post("/send-mail-login", async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin email hoặc tên người dùng",
    });
  }

  const mailOptions = {
    from: "Store",
    to: email,
    subject: "Đăng nhập thành công vào hệ thống Store",
    html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 20px;">
      <h2 style="color: #2b4eff; text-align: center;">Đăng nhập thành công 🎉</h2>
      <p>Xin chào <strong>${name}</strong>,</p>
      <p>Bạn vừa đăng nhập thành công vào tài khoản <strong>Store</strong> của mình.</p>

      <p>Nếu đây là bạn, không cần thực hiện thêm hành động nào.</p>
      <p style="color: #ff4d4f;">⚠️ Nếu bạn KHÔNG thực hiện đăng nhập này, vui lòng thay đổi mật khẩu ngay lập tức hoặc liên hệ với bộ phận hỗ trợ của chúng tôi để đảm bảo an toàn tài khoản.</p>
      <hr style="margin: 20px 0;" />
      <p style="font-size: 12px; color: #666; text-align: center;">
        Email này được gửi tự động từ hệ thống <strong>Store</strong>.<br/>
        Vui lòng không trả lời email này.
      </p>
    </div>
  </div>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({
      success: true,
      message: "Email đăng nhập đã được gửi thành công!",
    });
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    res.status(500).json({
      success: false,
      message: "Gửi email thất bại.",
      error: error.message,
    });
  }
});

router.post("/send-mail-order-success", async (req, res) => {
  let { data, email } = req.body;
  console.log(data, email);
  // Parse nếu là chuỗi
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu đơn hàng không hợp lệ.",
      });
    }
  }

  // Lấy thông tin đơn hàng thực tế (vì data có chứa { success, data })
  const order = data?.data || data;
  console.log("order", order);
  if (!order || !email) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin email hoặc đơn hàng.",
    });
  }

  const mailOptions = {
    from: "Store",
    to: email,
    subject: "Đặt hàng thành công -  Store 🎉",
    html: `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 650px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
    <div style="background-color: #0070ba; color: white; padding: 20px; text-align: center;">
      <h2>Xác nhận đặt hàng thành công 🎉</h2>
      <p>Cảm ơn bạn đã mua hàng tại <strong> Store</strong>!</p>
    </div>

    <div style="padding: 20px;">
      <h3>🧾 Thông tin đơn hàng</h3>
      <p><strong>Mã đơn hàng:</strong> ${order._id}</p>
      <p><strong>Trạng thái:</strong> Đã xác nhận ${
        order.paymentMethod === "paypal" ? "& Thanh toán thành công" : ""
      }</p>
      <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod}</p>
      <p><strong>Tổng tiền:</strong> ${Number(order.totalAmount).toLocaleString(
        "vi-VN"
      )} ₫</p>
      <p><strong>Ngày đặt hàng:</strong> ${new Date(
        order.orderDate
      ).toLocaleString("vi-VN")}</p>

      <hr style="margin: 20px 0;">

      <h3>📦 Sản phẩm đã mua</h3>
      ${order?.cartItems
        ?.map(
          (item) => `
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
          <img src="${item.image}" alt="${
            item.title
          }" width="100" style="border-radius: 8px;">
          <div>
            <p><strong>Tên sản phẩm:</strong> ${item.title}</p>
            <p><strong>Số lượng:</strong> ${item.quantity}</p>
            <p><strong>Giá:</strong> ${Number(item.price).toLocaleString(
              "vi-VN"
            )} ₫</p>
          </div>
        </div>
      `
        )
        .join("")}

      <hr style="margin: 20px 0;">

      <h3>📍 Thông tin giao hàng</h3>
      <p><strong>Địa chỉ:</strong> ${order.addressInfo.address}, ${
      order.addressInfo.city
    }</p>
      <p><strong>Mã bưu điện:</strong> ${order.addressInfo.pincode}</p>
      <p><strong>Số điện thoại:</strong> ${order.addressInfo.phone}</p>
      <p><strong>Ghi chú:</strong> ${order.addressInfo.notes || "Không có"}</p>

      <hr style="margin: 20px 0;">

     <h3>💳 Thông tin thanh toán</h3>
${
  order.payerId && order.paymentId
    ? `
      <div>
        <p><strong>Payment ID:</strong> ${order.paymentId}</p>
        <p><strong>Payer ID:</strong> ${order.payerId}</p>
      </div>
    `
    : ""
}

      <p><strong>Trạng thái thanh toán:</strong> ${
        order.paymentStatus === "paid" ? "Đã xong" : "Chưa thanh toán"
      }</p>

      <hr style="margin: 20px 0;">

      <p style="text-align: center; font-size: 15px;">
        Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.<br>
        Cảm ơn bạn đã tin tưởng và mua hàng tại <strong> Store</strong> 💙
      </p>
    </div>

    <div style="background-color: #f8f8f8; color: #777; text-align: center; padding: 10px; font-size: 13px;">
      © 2025  Store. Mọi quyền được bảo lưu.<br>
      <a href="https://store.vn" style="color: #0070ba; text-decoration: none;">store.vn</a>
    </div>
  </div>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({
      success: true,
      message: "Email xác nhận đơn hàng đã được gửi thành công!",
    });
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    res.status(500).json({
      success: false,
      message: "Gửi email thất bại.",
      error: error.message,
    });
  }
});

const getEmailContent = (status, order) => {
  const orderInfo = `
    <p><strong>Mã đơn hàng:</strong> ${order._id}</p>
    <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod}</p>
    <p><strong>Tổng tiền:</strong> ${Number(order.totalAmount).toLocaleString(
      "vi-VN"
    )} ₫</p>
  `;

  const shippingInfo = `
    <p><strong>Địa chỉ:</strong> ${order.addressInfo.address}, ${order.addressInfo.city}</p>
    <p><strong>SĐT:</strong> ${order.addressInfo.phone}</p>
  `;

  switch (status) {
    case "pending":
      return {
        subject: "🕓 Đơn hàng của bạn đang chờ xử lý",
        html: `
          <h2>Xin chào!</h2>
          <p>Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.</p>
          ${orderInfo}
          <p>Chúng tôi sẽ sớm xác nhận đơn hàng của bạn.</p>
        `,
      };

    case "inProcess":
      return {
        subject: "⚙️ Đơn hàng của bạn đang được xử lý",
        html: `
          <h2>Đơn hàng đang được xử lý</h2>
          <p>Đội ngũ của chúng tôi đang chuẩn bị hàng cho bạn.</p>
          ${orderInfo}
          <p>Chúng tôi sẽ sớm bàn giao cho đơn vị vận chuyển.</p>
        `,
      };

    case "inShipping":
      return {
        subject: "🚚 Đơn hàng của bạn đang được vận chuyển",
        html: `
          <h2>Đơn hàng đang được giao!</h2>
          ${orderInfo}
          ${shippingInfo}
          <p>Vui lòng giữ điện thoại để đơn vị giao hàng có thể liên hệ.</p>
        `,
      };

    case "delivered":
      return {
        subject: "✅ Đơn hàng đã được giao thành công",
        html: `
          <h2>Cảm ơn bạn đã mua hàng tại Store!</h2>
          ${orderInfo}
          <p>Chúng tôi hy vọng bạn hài lòng với sản phẩm. Hãy đánh giá để chúng tôi phục vụ tốt hơn 💙</p>
        `,
      };

    case "rejected":
      return {
        subject: "❌ Đơn hàng của bạn đã bị hủy",
        html: `
          <h2>Đơn hàng bị hủy</h2>
          ${orderInfo}
          <p>Rất tiếc! Đơn hàng của bạn đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ đội ngũ hỗ trợ của chúng tôi.</p>
        `,
      };

    default:
      return {
        subject: "Cập nhật đơn hàng",
        html: "<p>Đơn hàng của bạn đã được cập nhật trạng thái.</p>",
      };
  }
};

// 🔹 API gửi email
router.post("/send-mail-order-status", async (req, res) => {
  try {
    const { idUser, orderStatus, data } = req.body;
    console.log(idUser, orderStatus, data);
    if (!idUser || !orderStatus || !data) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin email, trạng thái hoặc dữ liệu đơn hàng.",
      });
    }

    const emailUser = await User.findById(idUser);

    console.log(emailUser.email);

    const { subject, html } = getEmailContent(orderStatus, data);

    const mailOptions = {
      from: "Store",
      to: emailUser.email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          ${html}
          <hr style="margin: 20px 0;">
          <p style="font-size: 14px; color: #777; text-align: center;">
            © 2025 Store - Cảm ơn bạn đã tin tưởng mua sắm 💙<br>
            <a href="https://store.vn" style="color: #0070ba; text-decoration: none;">store.vn</a>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({
      success: true,
      message: "Email thông báo trạng thái đơn hàng đã được gửi.",
    });
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    res.status(500).json({
      success: false,
      message: "Không thể gửi email.",
      error: error.message,
    });
  }
});

module.exports = router;
