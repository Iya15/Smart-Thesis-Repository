import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { error } from "../utils/response.util";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Memory storage is required here (not CloudinaryStorage) because
// pdf-parse needs access to req.file.buffer for text extraction.
// The buffer is piped to Cloudinary manually in file.service.ts.
const multerInstance = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted"));
    }
  },
});

// Wrapper that converts Multer errors into consistent JSON responses
export const uploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  multerInstance.single("file")(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        error(res, "File size must not exceed 10 MB", 400);
        return;
      }
      error(res, err.message, 400);
      return;
    }
    if (err instanceof Error) {
      error(res, err.message, 400);
      return;
    }
    next();
  });
};
