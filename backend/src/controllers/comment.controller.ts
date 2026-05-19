import { Request, Response } from "express";
import { z } from "zod";
import * as commentService from "../services/comment.service";
import { success, error } from "../utils/response.util";

const addCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be under 1000 characters"),
});

export const add = async (req: Request, res: Response): Promise<void> => {
  const parsed = addCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    error(res, parsed.error.errors[0].message, 400);
    return;
  }

  try {
    const comment = await commentService.addComment(
      req.params.thesisId,
      req.user!.id,
      parsed.data.content
    );
    success(res, comment, "Comment added", 201);
  } catch (err: unknown) {
    console.error("[comment.add]", err);
    error(res, "Failed to add comment", 500);
  }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const comments = await commentService.getComments(req.params.thesisId);
    success(res, comments, "Comments retrieved");
  } catch (err: unknown) {
    console.error("[comment.getAll]", err);
    error(res, "Failed to retrieve comments", 500);
  }
};
