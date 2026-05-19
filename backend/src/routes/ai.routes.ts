import { Router } from "express";
import * as aiController from "../controllers/ai.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All AI routes require a valid session
router.use(authMiddleware);

// ─── Generation endpoints ─────────────────────────────────────────────────────
router.post("/summarize/:thesisId", aiController.summarize);
router.post("/abstract/:thesisId", aiController.generateAbstract);
router.post("/titles/:thesisId", aiController.suggestTitles);
router.post("/citation/:thesisId", aiController.formatCitation);
router.post("/related/:thesisId", aiController.relatedStudies);

// ─── Read endpoints ───────────────────────────────────────────────────────────
router.get("/outputs/:thesisId", aiController.getOutputs);
router.get("/usage", aiController.getUsage);

export default router;
