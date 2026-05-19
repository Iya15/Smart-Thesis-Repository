import { Router } from "express";
import * as commentController from "../controllers/comment.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "@prisma/client";

const router = Router();

// Any authenticated user can read comments
router.get("/:thesisId", authMiddleware, commentController.getAll);

// Only ADMIN and ADVISER can post comments
router.post(
  "/:thesisId",
  authMiddleware,
  requireRole(Role.ADMIN, Role.ADVISER),
  commentController.add
);

export default router;
