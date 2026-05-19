import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

export interface TokenPayload {
  id: string;
  role: Role;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined in environment");
  return secret;
};

export const signToken = (userId: string, role: Role): string => {
  return jwt.sign({ id: userId, role }, JWT_SECRET(), {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET()) as TokenPayload;
  } catch {
    return null;
  }
};
