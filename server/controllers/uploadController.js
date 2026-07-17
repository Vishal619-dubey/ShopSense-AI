import { v2 as cloudinary } from "cloudinary";

function configured() {
  return process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;
}

export async function uploadImage(req, res) {
  if (!req.file) return res.status(400).json({ message: "Image file is required" });

  if (!configured()) {
    return res.status(503).json({
      message: "Cloudinary is not configured. Add Cloudinary environment variables or use an image URL."
    });
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "shopsense-ai/products",
    resource_type: "image"
  });

  res.json({ url: result.secure_url, publicId: result.public_id });
}