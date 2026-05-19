import { Role } from "@prisma/client";

// Augment Express's Request interface so req.user is typed everywhere in the codebase.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
    }
  }
}

export {};
