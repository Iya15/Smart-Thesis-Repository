import { Prisma } from "@prisma/client";
import prisma from "../config/db";

type CommentWithAuthor = Prisma.CommentGetPayload<{
  include: { author: { select: { id: true; name: true; role: true } } };
}>;

export const addComment = async (
  thesisId: string,
  authorId: string,
  content: string
): Promise<CommentWithAuthor> => {
  return prisma.comment.create({
    data: { thesisId, authorId, content: content.trim() },
    include: {
      author: { select: { id: true, name: true, role: true } },
    },
  });
};

export const getComments = async (
  thesisId: string
): Promise<CommentWithAuthor[]> => {
  return prisma.comment.findMany({
    where: { thesisId },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, role: true } },
    },
  });
};
