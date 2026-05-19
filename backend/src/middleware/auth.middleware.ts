import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.util";
import { error } from "../utils/response.util";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token: string | undefined = req.cookies?.token;

  if (!token) {
    error(res, "Authentication required", 401);
    return;
  }

  const payload = verifyToken(token);

  if (!payload) {
    error(res, "Invalid or expired token", 401);
    return;
  }

  req.user = { id: payload.id, role: payload.role };
  next();
};
