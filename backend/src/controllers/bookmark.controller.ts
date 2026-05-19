import { Request, Response } from "express";
import * as bookmarkService from "../services/bookmark.service";
import { success, error } from "../utils/response.util";

export const toggle = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await bookmarkService.toggleBookmark(
      req.user!.id,
      req.params.thesisId
    );
    success(
      res,
      result,
      result.bookmarked ? "Thesis bookmarked" : "Bookmark removed"
    );
  } catch (err: unknown) {
    console.error("[bookmark.toggle]", err);
    error(res, "Failed to toggle bookmark", 500);
  }
};

export const checkStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookmarked = await bookmarkService.checkBookmark(
      req.user!.id,
      req.params.thesisId
    );
    success(res, { bookmarked }, "Bookmark status retrieved");
  } catch (err: unknown) {
    console.error("[bookmark.checkStatus]", err);
    error(res, "Failed to check bookmark status", 500);
  }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const theses = await bookmarkService.getUserBookmarks(req.user!.id);
    success(res, theses, "Bookmarks retrieved");
  } catch (err: unknown) {
    console.error("[bookmark.getAll]", err);
    error(res, "Failed to retrieve bookmarks", 500);
  }
};
