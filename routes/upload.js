
const express = require("express");
const router = express.Router();
const cloudinary = require("../utils/cloudinary");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: "Error subiendo imagen" });
  }
});

module.exports = router;