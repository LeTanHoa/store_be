const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hoa_2051220041@dau.edu.vn", // email của bạn
    pass: "ifrx ntcq ywkr qtiv", // app password
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Lỗi cấu hình email:", error);
  } else {
    console.log("✅ Email transporter đã sẵn sàng để gửi mail!");
  }
});

module.exports = transporter;
