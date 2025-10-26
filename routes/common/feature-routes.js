const express = require("express");
const {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage,
} = require("../../controllers/common/feature-controller");
const { upload } = require("../../helpers/cloudinary");

const router = express.Router();

router.post("/add", upload.single("my_files"), addFeatureImage);
router.get("/get", getFeatureImages);
router.delete("/delete/:id", deleteFeatureImage);

module.exports = router;
