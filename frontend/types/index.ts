// ─── Enums (mirror Prisma enums) ─────────────────────────────────────────────

export type Role = "STUDENT" | "ADMIN" | "ADVISER";

export type Status = "PENDING" | "APPROVED" | "REJECTED";

export type AiType =
  | "SUMMARY"
  | "ABSTRACT"
  | "TITLE_SUGGESTION"
  | "CITATION"
  | "RELATED_STUDIES";

// ─── Domain Interfaces ────────────────────────────────────────────────────────

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface ITag {
  id: string;
  name: string;
}

export interface IThesis {
  id: string;
  title: string;
  abstract: string | null;
  authorId: string;
  author?: IUser;
  status: Status;
  fileUrl: string;
  filePublicId: string;
  extractedText: string | null;
  year: number | null;
  course: string | null;
  tags: ITag[];
  createdAt: string;
  updatedAt: string;
}

export interface IAiOutput {
  id: string;
  thesisId: string;
  thesis?: IThesis;
  type: AiType;
  content: string;
  createdAt: string;
}

export interface IBookmark {
  id: string;
  userId: string;
  thesisId: string;
  user?: IUser;
  thesis?: IThesis;
  createdAt: string;
}

export interface IComment {
  id: string;
  thesisId: string;
  authorId: string;
  content: string;
  author?: IUser;
  createdAt: string;
}

export interface IAiUsage {
  id: string;
  userId: string;
  type: AiType;
  usedAt: string;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
