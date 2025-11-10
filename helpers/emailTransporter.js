const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "huynhletrong23@gmail.com", // email của bạn
    pass: "ofyj uyhq hgud dwke", // app password
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
