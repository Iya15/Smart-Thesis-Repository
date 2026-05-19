import bcrypt from "bcryptjs";
import { User } from "@prisma/client";
import prisma from "../config/db";

const BCRYPT_ROUNDS = 12;

// Safe user shape — password is never returned from the service layer
export type SafeUser = Omit<User, "password">;

export const register = async (
  name: string,
  email: string,
  password: string
): Promise<SafeUser> => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("EMAIL_TAKEN");
  }

  const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  const { password: _, ...safeUser } = user;
  return safeUser;
};

export const login = async (
  email: string,
  password: string
): Promise<SafeUser> => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Always run bcrypt compare to prevent timing-based email enumeration
  const dummyHash =
    "$2a$12$invalidhashusedfortimingprotectiononly000000000000000000";
  const isMatch = user
    ? await bcrypt.compare(password, user.password)
    : await bcrypt.compare(password, dummyHash).then(() => false);

  if (!user || !isMatch) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const { password: _, ...safeUser } = user;
  return safeUser;
};

export const getMe = async (userId: string): Promise<SafeUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user as SafeUser;
};
