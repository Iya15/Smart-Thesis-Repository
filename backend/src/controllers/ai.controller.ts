import { Request, Response } from "express";
import * as aiService from "../services/ai.service";
import { success, error } from "../utils/response.util";

// ─── Shared error handler ─────────────────────────────────────────────────────

const handleAiError = (res: Response, err: unknown, context: string): void => {
  if (err instanceof Error) {
    switch (err.message) {
      case "DAILY_LIMIT_REACHED":
        error(
          res,
          "You have reached the daily AI limit (10 requests/day). Try again tomorrow.",
          429
        );
        return;
      case "THESIS_NOT_FOUND":
        error(res, "Thesis not found", 404);
        return;
      case "NO_CONTENT_AVAILABLE":
        error(
          res,
          "This thesis has no extracted text or abstract for AI analysis. Ensure the PDF was processed correctly.",
          422
        );
        return;
    }
  }
  console.error(`[ai.${context}]`, err);
  error(res, "AI generation failed. Please try again.", 500);
};

// ─── Generate controllers ─────────────────────────────────────────────────────

export const summarize = async (req: Request, res: Response): Promise<void> => {
  try {
    const output = await aiService.generateSummary(
      req.params.thesisId,
      req.user!.id
    );
    success(res, output, "Summary generated successfully");
  } catch (err) {
    handleAiError(res, err, "summarize");
  }
};

export const generateAbstract = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const output = await aiService.generateAbstract(
      req.params.thesisId,
      req.user!.id
    );
    success(res, output, "Abstract generated successfully");
  } catch (err) {
    handleAiError(res, err, "generateAbstract");
  }
};

export const suggestTitles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const output = await aiService.suggestTitles(
      req.params.thesisId,
      req.user!.id
    );
    success(res, output, "Title suggestions generated successfully");
  } catch (err) {
    handleAiError(res, err, "suggestTitles");
  }
};

export const formatCitation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const output = await aiService.formatCitation(
      req.params.thesisId,
      req.user!.id
    );
    success(res, output, "Citation formatted successfully");
  } catch (err) {
    handleAiError(res, err, "formatCitation");
  }
};

export const relatedStudies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const output = await aiService.suggestRelatedStudies(
      req.params.thesisId,
      req.user!.id
    );
    success(res, output, "Related studies suggestions generated");
  } catch (err) {
    handleAiError(res, err, "relatedStudies");
  }
};

// ─── Read controllers ─────────────────────────────────────────────────────────

export const getOutputs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outputs = await aiService.getAiOutputs(req.params.thesisId);
    success(res, outputs, "AI outputs retrieved");
  } catch (err) {
    console.error("[ai.getOutputs]", err);
    error(res, "Failed to retrieve AI outputs", 500);
  }
};

export const getUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await aiService.getTodayUsageCount(req.user!.id);
    success(res, { count, limit: 10 }, "Usage retrieved");
  } catch (err) {
    console.error("[ai.getUsage]", err);
    error(res, "Failed to retrieve usage count", 500);
  }
};
