import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// CloudinaryStorage engine — exported for completeness and future use cases
// where a buffer is not required (e.g. image uploads).
// NOTE: The thesis upload pipeline uses multer memoryStorage + manual upload_stream
// instead, because pdf-parse requires access to req.file.buffer for text extraction.
// CloudinaryStorage streams directly to Cloudinary and never populates req.file.buffer.
export const multerStorageEngine = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "thesis-repository/theses",
    allowed_formats: ["pdf"],
    resource_type: "raw",
  } as object,
});

export default cloudinary;
