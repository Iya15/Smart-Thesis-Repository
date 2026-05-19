import { Router } from "express";
import * as bookmarkController from "../controllers/bookmark.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All bookmark routes require authentication
router.use(authMiddleware);

// GET /:thesisId/status must come before POST /:thesisId so Express
// doesn't try to call toggle when the path ends with "/status"
router.get("/:thesisId/status", bookmarkController.checkStatus);
router.get("/", bookmarkController.getAll);
router.post("/:thesisId", bookmarkController.toggle);

export default router;
