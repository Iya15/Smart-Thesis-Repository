import { Response } from "express";

export const success = <T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): Response => {
  return res.status(statusCode).json({ message, data });
};

export const error = (
  res: Response,
  message = "An unexpected error occurred",
  statusCode = 500
): Response => {
  return res.status(statusCode).json({ message });
};
