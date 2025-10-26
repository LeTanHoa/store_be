const Feature = require("../../models/Feature");
const { imageUploadUtil } = require("../../helpers/cloudinary");

const addFeatureImage = async (req, res) => {
  const { type } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Upload lên Cloudinary
    const uploadResult = await imageUploadUtil(req.file);

    // Lưu vào MongoDB
    const newFeature = new Feature({
      image: uploadResult.secure_url,
      type,
    });
    await newFeature.save();

    res.status(201).json({
      success: true,
      data: newFeature,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Upload failed!",
    });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({});
    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: "Get failed!" });
  }
};

const deleteFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;
    await Feature.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (e) {
    res.status(500).json({ success: false, message: "Delete failed!" });
  }
};

module.exports = { addFeatureImage, getFeatureImages, deleteFeatureImage };
