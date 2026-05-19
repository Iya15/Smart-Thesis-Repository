import { Prisma } from "@prisma/client";
import prisma from "../config/db";

const authorSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

type ThesisWithDetails = Prisma.ThesisGetPayload<{
  include: { author: { select: typeof authorSelect }; tags: true };
}>;

export const toggleBookmark = async (
  userId: string,
  thesisId: string
): Promise<{ bookmarked: boolean }> => {
  // Use Prisma's compound unique key (generated from @@unique([userId, thesisId]))
  const existing = await prisma.bookmark.findUnique({
    where: { userId_thesisId: { userId, thesisId } },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { userId_thesisId: { userId, thesisId } },
    });
    return { bookmarked: false };
  }

  await prisma.bookmark.create({ data: { userId, thesisId } });
  return { bookmarked: true };
};

export const checkBookmark = async (
  userId: string,
  thesisId: string
): Promise<boolean> => {
  const bookmark = await prisma.bookmark.findUnique({
    where: { userId_thesisId: { userId, thesisId } },
  });
  return Boolean(bookmark);
};

export const getUserBookmarks = async (
  userId: string
): Promise<ThesisWithDetails[]> => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      thesis: {
        include: {
          author: { select: authorSelect },
          tags: true,
        },
      },
    },
  });

  return bookmarks.map((b) => b.thesis);
};
