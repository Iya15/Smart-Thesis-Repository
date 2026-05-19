import { Prisma, Status } from "@prisma/client";
import prisma from "../config/db";

// ─── Input Types ──────────────────────────────────────────────────────────────

export interface CreateThesisInput {
  title: string;
  abstract?: string;
  year?: number;
  course?: string;
  tags?: string[];
  authorId: string;
  fileUrl: string;
  filePublicId: string;
  extractedText?: string;
}

export interface ThesisQueryInput {
  page: number;
  limit: number;
  search?: string;
  status?: Status;
  course?: string;
  year?: number;
  tags?: string[];
}

// ─── Prisma payload types ─────────────────────────────────────────────────────

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

type ThesisWithFullDetails = Prisma.ThesisGetPayload<{
  include: {
    author: { select: typeof authorSelect };
    tags: true;
    aiOutputs: true;
    comments: {
      include: { author: { select: { id: true; name: true; role: true } } };
    };
  };
}>;

export interface PaginatedTheses {
  data: ThesisWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Build Prisma WHERE from shared filter fields (used in both FTS and non-FTS paths)
const buildWhere = (
  status: Status | undefined,
  course: string | undefined,
  year: number | undefined,
  tags: string[] | undefined,
  ids?: string[]
): Prisma.ThesisWhereInput => ({
  // When ids is provided (FTS path), scope to only those results
  ...(ids !== undefined && { id: { in: ids } }),
  // Undefined status means no status filter (admin "show all" mode)
  ...(status !== undefined && { status }),
  ...(course && { course: { contains: course, mode: "insensitive" as const } }),
  ...(year && { year }),
  ...(tags?.length && { tags: { some: { name: { in: tags } } } }),
});

// ─── Service Functions ────────────────────────────────────────────────────────

export const createThesis = async (
  input: CreateThesisInput
): Promise<ThesisWithDetails> => {
  const { tags = [], ...rest } = input;

  const tagOperations = tags
    .map((t) => t.toLowerCase().trim())
    .filter(Boolean)
    .map((name) => ({ where: { name }, create: { name } }));

  return prisma.thesis.create({
    data: { ...rest, tags: { connectOrCreate: tagOperations } },
    include: { author: { select: authorSelect }, tags: true },
  });
};

export const getTheses = async (
  input: ThesisQueryInput
): Promise<PaginatedTheses> => {
  const {
    page,
    limit,
    search,
    // Default to APPROVED so the public endpoint never leaks PENDING/REJECTED theses
    status = Status.APPROVED,
    course,
    year,
    tags,
  } = input;
  const skip = (page - 1) * limit;

  // ── Full-text search path (PostgreSQL native FTS) ─────────────────────────
  // NOTE: to_tsvector is evaluated on-the-fly here. For large datasets, add a
  // GIN index on a persisted tsvector column via a Prisma migration.
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
      // plainto_tsquery can fail on malformed input — fall back to empty result
      console.error("[thesis.service] FTS query error:", err);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    // Short-circuit: FTS found nothing, no point running further queries
    if (ids.length === 0) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    // Apply remaining filters on the FTS-matched IDs via Prisma ORM
    const where = buildWhere(status, course, year, tags, ids);

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

  // ── Standard Prisma path (no search term) ────────────────────────────────
  const where = buildWhere(status, course, year, tags);

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

export const getThesisById = async (
  id: string
): Promise<ThesisWithFullDetails | null> => {
  return prisma.thesis.findUnique({
    where: { id },
    include: {
      author: { select: authorSelect },
      tags: true,
      aiOutputs: { orderBy: { createdAt: "desc" } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, role: true } },
        },
      },
    },
  });
};

export const getMyTheses = async (
  authorId: string
): Promise<ThesisWithDetails[]> => {
  return prisma.thesis.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: authorSelect }, tags: true },
  });
};

export const updateThesisStatus = async (
  id: string,
  status: Status
): Promise<ThesisWithDetails> => {
  return prisma.thesis.update({
    where: { id },
    data: { status },
    include: { author: { select: authorSelect }, tags: true },
  });
};
