import { Readable } from "stream";
import cloudinary from "../config/cloudinary";

const CLOUDINARY_FOLDER = "thesis-repository/theses";

export const uploadToCloudinary = (
  file: Express.Multer.File
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    // Sanitise the original filename to use as part of the public_id
    const baseName = file.originalname
      .replace(/\.[^.]+$/, "")  // strip extension
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 60);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: "raw",
        public_id: `${baseName}_${Date.now()}`,
        format: "pdf",
      },
      (uploadError, result) => {
        if (uploadError || !result) {
          reject(uploadError ?? new Error("Cloudinary upload returned no result"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    // Pipe the in-memory buffer into the Cloudinary write stream
    Readable.from(file.buffer).pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  // resource_type must match what was used during upload
  await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
};
