import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { error } from "../utils/response.util";

// Factory that returns a middleware enforcing the caller has one of the allowed roles.
export const requireRole =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      error(res, "You do not have permission to access this resource", 403);
      return;
    }
    next();
  };
