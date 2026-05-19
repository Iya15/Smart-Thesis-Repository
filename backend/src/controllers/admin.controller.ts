import { Request, Response } from "express";
import { Status } from "@prisma/client";
import * as adminService from "../services/admin.service";
import { success, error } from "../utils/response.util";

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await adminService.getStats();
    success(res, stats, "Platform statistics retrieved");
  } catch (err: unknown) {
    console.error("[admin.getStats]", err);
    error(res, "Failed to retrieve statistics", 500);
  }
};

export const getAllTheses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(String(req.query.limit ?? "10"), 10))
    );
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const course =
      typeof req.query.course === "string" ? req.query.course.trim() : undefined;
    const year =
      typeof req.query.year === "string" && req.query.year
        ? parseInt(req.query.year, 10) || undefined
        : undefined;
    const tags =
      typeof req.query.tags === "string" && req.query.tags
        ? req.query.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined;

    // Admin explicitly passes status; if omitted → undefined → no status filter
    const statusRaw =
      typeof req.query.status === "string" ? req.query.status : undefined;
    const status =
      statusRaw && Object.values(Status).includes(statusRaw as Status)
        ? (statusRaw as Status)
        : undefined;

    const result = await adminService.getAllTheses({
      page,
      limit,
      search,
      status,
      course,
      year,
      tags,
    });

    success(res, result, "Theses retrieved");
  } catch (err: unknown) {
    console.error("[admin.getAllTheses]", err);
    error(res, "Failed to retrieve theses", 500);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(String(req.query.limit ?? "10"), 10))
    );

    const result = await adminService.getAllUsers(page, limit);
    success(res, result, "Users retrieved");
  } catch (err: unknown) {
    console.error("[admin.getAllUsers]", err);
    error(res, "Failed to retrieve users", 500);
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await adminService.deleteUser(req.params.id, req.user!.id);
    success(res, null, "User deleted successfully");
  } catch (err: unknown) {
    if (err instanceof Error) {
      switch (err.message) {
        case "CANNOT_DELETE_SELF":
          error(res, "You cannot delete your own account", 400);
          return;
        case "CANNOT_DELETE_ADMIN":
          error(res, "Admin accounts cannot be deleted", 403);
          return;
        case "USER_NOT_FOUND":
          error(res, "User not found", 404);
          return;
      }
    }
    console.error("[admin.deleteUser]", err);
    error(res, "Failed to delete user", 500);
  }
};
