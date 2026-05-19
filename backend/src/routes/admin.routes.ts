import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "@prisma/client";

const router = Router();

// Every admin route requires a valid session and ADMIN role
router.use(authMiddleware);
router.use(requireRole(Role.ADMIN));

router.get("/stats", adminController.getStats);
router.get("/theses", adminController.getAllTheses);
router.get("/users", adminController.getAllUsers);
router.delete("/users/:id", adminController.deleteUser);

export default router;
