import { Prisma, Status, Role } from "@prisma/client";
import prisma from "../config/db";
import { ThesisQueryInput, PaginatedTheses } from "./thesis.service";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalTheses: number;
  pendingTheses: number;
  approvedTheses: number;
  totalAiRequests: number;
}

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  _count: { theses: number };
};

export interface PaginatedAdminUsers {
  data: AdminUserRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Thesis select (matches thesis.service authorSelect) ──────────────────────

const authorSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

// ─── getAllTheses ─────────────────────────────────────────────────────────────
// Same logic as thesis.service.getTheses but without the APPROVED default —
// admin sees ALL statuses unless an explicit status filter is passed.

const buildAdminWhere = (
  status: Status | undefined,
  course: string | undefined,
  year: number | undefined,
  tags: string[] | undefined,
  ids?: string[]
): Prisma.ThesisWhereInput => ({
  ...(ids !== undefined && { id: { in: ids } }),
  // No default here — undefined means "no status filter" (show everything)
  ...(status !== undefined && { status }),
  ...(course && { course: { contains: course, mode: "insensitive" as const } }),
  ...(year && { year }),
  ...(tags?.length && { tags: { some: { name: { in: tags } } } }),
});

export const getAllTheses = async (
  input: ThesisQueryInput
): Promise<PaginatedTheses> => {
  const { page, limit, search, status, course, year, tags } = input;
  const skip = (page - 1) * limit;

  if (search?.trim()) {
    let ids: string[] = [];
    try {
      const ftsRows = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT t.id
        FROM "Thesis" t
        WHERE to_tsvector('english',
            coalesce(t.title, '')         || ' ' ||
            coalesce(t.abstract, '')      || ' ' ||
            coalesce(t."extractedText",'')|| ' ' ||
            coalesce(t.course, '')
        ) @@ plainto_tsquery('english', ${search.trim()})
      `;
      ids = ftsRows.map((r) => r.id);
    } catch (err) {
      console.error("[admin.getAllTheses] FTS error:", err);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    if (ids.length === 0) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    const where = buildAdminWhere(status, course, year, tags, ids);
    const [data, total] = await prisma.$transaction([
      prisma.thesis.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { author: { select: authorSelect }, tags: true },
      }),
      prisma.thesis.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  const where = buildAdminWhere(status, course, year, tags);
  const [data, total] = await prisma.$transaction([
    prisma.thesis.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { author: { select: authorSelect }, tags: true },
    }),
    prisma.thesis.count({ where }),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// ─── getStats ─────────────────────────────────────────────────────────────────

export const getStats = async (): Promise<AdminStats> => {
  const [
    totalUsers,
    totalTheses,
    pendingTheses,
    approvedTheses,
    totalAiRequests,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.thesis.count(),
    prisma.thesis.count({ where: { status: Status.PENDING } }),
    prisma.thesis.count({ where: { status: Status.APPROVED } }),
    prisma.aiUsage.count(),
  ]);

  return {
    totalUsers,
    totalTheses,
    pendingTheses,
    approvedTheses,
    totalAiRequests,
  };
};

// ─── getAllUsers ──────────────────────────────────────────────────────────────

export const getAllUsers = async (
  page: number,
  limit: number
): Promise<PaginatedAdminUsers> => {
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { theses: true } },
      },
    }),
    prisma.user.count(),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// ─── deleteUser ───────────────────────────────────────────────────────────────
// Manually cascade-deletes all related records because the Prisma schema does
// not define onDelete: Cascade — PostgreSQL enforces FK constraints by default.

export const deleteUser = async (
  userId: string,
  requestingAdminId: string
): Promise<void> => {
  if (userId === requestingAdminId) throw new Error("CANNOT_DELETE_SELF");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("USER_NOT_FOUND");
  if (user.role === Role.ADMIN) throw new Error("CANNOT_DELETE_ADMIN");

  await prisma.$transaction(async (tx) => {
    // Collect IDs of theses authored by this user
    const thesisIds = (
      await tx.thesis.findMany({
        where: { authorId: userId },
        select: { id: true },
      })
    ).map((t) => t.id);

    // Delete thesis-level children first
    if (thesisIds.length > 0) {
      await tx.aiOutput.deleteMany({ where: { thesisId: { in: thesisIds } } });
      await tx.bookmark.deleteMany({ where: { thesisId: { in: thesisIds } } });
      await tx.comment.deleteMany({ where: { thesisId: { in: thesisIds } } });
    }

    // Delete user-level records
    await tx.bookmark.deleteMany({ where: { userId } });
    await tx.comment.deleteMany({ where: { authorId: userId } });
    await tx.aiUsage.deleteMany({ where: { userId } });

    // Delete the theses themselves, then the user
    await tx.thesis.deleteMany({ where: { authorId: userId } });
    await tx.user.delete({ where: { id: userId } });
  });
};
