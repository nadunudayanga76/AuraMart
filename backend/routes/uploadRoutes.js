import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Multer setup for memory storage (we will upload directly from memory to cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
    });

    res.send({
      message: 'Image Uploaded Successfully',
      image: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
