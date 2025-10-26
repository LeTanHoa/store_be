// const cloudinary = require("cloudinary").v2;
// const multer = require("multer");

// cloudinary.config({
//   cloud_name: "dsnu89olo",
//   api_key: "271753395358454",
//   api_secret: "2uvTU-p36ZDZ_RuqErEDtLX44AI",
// });

// const storage = new multer.memoryStorage();

// async function imageUploadUtil(file) {
//   const result = await cloudinary.uploader.upload(file, {
//     resource_type: "auto",
//   });

//   return result;
// }

// const upload = multer({ storage });

// module.exports = { upload, imageUploadUtil };


const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: "dsnu89olo",
  api_key: "271753395358454",
  api_secret: "2uvTU-p36ZDZ_RuqErEDtLX44AI",
});

const storage = multer.memoryStorage();

/**
 * Upload file buffer lên Cloudinary
 * @param {Object} file - file từ multer.memoryStorage()
 */
async function imageUploadUtil(file) {
  try {
    // Chuyển buffer -> base64
    const base64String = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    // Upload base64 lên Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      resource_type: "auto",
      folder: "feature_images", // tuỳ chọn, giúp tổ chức file
    });

    return result;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };
