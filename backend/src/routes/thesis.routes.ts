import { Router } from "express";
import * as thesisController from "../controllers/thesis.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { uploadMiddleware } from "../middleware/upload.middleware";
import { Role } from "@prisma/client";

const router = Router();

// ─── Public routes ────────────────────────────────────────────────────────────
router.get("/", thesisController.getAll);

// /mine must be declared BEFORE /:id — Express matches routes in order and
// would otherwise interpret "mine" as a thesis ID.
router.get("/mine", authMiddleware, thesisController.getMine);

router.get("/:id", thesisController.getOne);

// ─── Protected routes ─────────────────────────────────────────────────────────
router.post("/", authMiddleware, uploadMiddleware, thesisController.upload);

router.patch(
  "/:id/status",
  authMiddleware,
  requireRole(Role.ADMIN),
  thesisController.updateStatus
);

export default router;
