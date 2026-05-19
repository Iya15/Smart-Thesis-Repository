import { Request, Response } from "express";
import { z } from "zod";
import { Status } from "@prisma/client";
import * as thesisService from "../services/thesis.service";
import * as fileService from "../services/file.service";
import { extractTextFromBuffer } from "../utils/pdf.util";
import { success, error } from "../utils/response.util";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();

const uploadSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(300, "Title must be under 300 characters"),
  abstract: z
    .string()
    .max(5000, "Abstract must be under 5000 characters")
    .optional(),
  year: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v.trim() === "") return undefined;
      const n = parseInt(v, 10);
      return isNaN(n) ? undefined : n;
    })
    .refine(
      (v) => v === undefined || (v >= 1900 && v <= CURRENT_YEAR + 1),
      { message: `Year must be between 1900 and ${CURRENT_YEAR + 1}` }
    ),
  course: z.string().max(100, "Course name too long").optional(),
  tags: z
    .string()
    .optional()
    .transform((v) =>
      v ? v.split(",").map((t) => t.trim()).filter(Boolean) : []
    ),
});

const updateStatusSchema = z.object({
  status: z.enum([Status.APPROVED, Status.REJECTED], {
    errorMap: () => ({ message: "Status must be APPROVED or REJECTED" }),
  }),
});

// ─── Controllers ──────────────────────────────────────────────────────────────

export const upload = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    error(res, "A PDF file is required", 400);
    return;
  }

  const parsed = uploadSchema.safeParse(req.body);
  if (!parsed.success) {
    error(res, parsed.error.errors[0].message, 400);
    return;
  }

  let cloudinaryResult: { url: string; publicId: string } | null = null;

  try {
    cloudinaryResult = await fileService.uploadToCloudinary(req.file);
    const extractedText = await extractTextFromBuffer(req.file.buffer);

    const thesis = await thesisService.createThesis({
      ...parsed.data,
      authorId: req.user!.id,
      fileUrl: cloudinaryResult.url,
      filePublicId: cloudinaryResult.publicId,
      extractedText,
    });

    success(res, thesis, "Thesis uploaded successfully", 201);
  } catch (err: unknown) {
    if (cloudinaryResult) {
      fileService
        .deleteFromCloudinary(cloudinaryResult.publicId)
        .catch((e) => console.error("[thesis.upload] Cloudinary cleanup failed:", e));
    }
    console.error("[thesis.upload]", err);
    error(res, "Failed to upload thesis. Please try again.", 500);
  }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
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

    // tags=ai,healthcare → ["ai", "healthcare"]
    const tags =
      typeof req.query.tags === "string" && req.query.tags
        ? req.query.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined;

    // status: if "ALL" is explicitly passed, pass undefined to show everything (admin mode)
    // otherwise default to APPROVED for the public listing
    const statusRaw = typeof req.query.status === "string" ? req.query.status : undefined;
    let statusFilter: Status | undefined;
    if (statusRaw === "ALL" || statusRaw === undefined || statusRaw === "") {
      statusFilter = statusRaw === "ALL" ? undefined : Status.APPROVED;
    } else if (Object.values(Status).includes(statusRaw as Status)) {
      statusFilter = statusRaw as Status;
    } else {
      statusFilter = Status.APPROVED;
    }

    const result = await thesisService.getTheses({
      page,
      limit,
      search,
      status: statusFilter,
      course,
      year,
      tags,
    });

    success(res, result, "Theses retrieved successfully");
  } catch (err: unknown) {
    console.error("[thesis.getAll]", err);
    error(res, "Failed to retrieve theses", 500);
  }
};

export const getOne = async (req: Request, res: Response): Promise<void> => {
  try {
    const thesis = await thesisService.getThesisById(req.params.id);
    if (!thesis) {
      error(res, "Thesis not found", 404);
      return;
    }
    success(res, thesis, "Thesis retrieved successfully");
  } catch (err: unknown) {
    console.error("[thesis.getOne]", err);
    error(res, "Failed to retrieve thesis", 500);
  }
};

export const getMine = async (req: Request, res: Response): Promise<void> => {
  try {
    const theses = await thesisService.getMyTheses(req.user!.id);
    success(res, theses, "Your theses retrieved successfully");
  } catch (err: unknown) {
    console.error("[thesis.getMine]", err);
    error(res, "Failed to retrieve your theses", 500);
  }
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    error(res, parsed.error.errors[0].message, 400);
    return;
  }

  try {
    const thesis = await thesisService.getThesisById(req.params.id);
    if (!thesis) {
      error(res, "Thesis not found", 404);
      return;
    }

    const updated = await thesisService.updateThesisStatus(
      req.params.id,
      parsed.data.status
    );

    success(res, updated, `Thesis ${parsed.data.status.toLowerCase()} successfully`);
  } catch (err: unknown) {
    console.error("[thesis.updateStatus]", err);
    error(res, "Failed to update thesis status", 500);
  }
};
