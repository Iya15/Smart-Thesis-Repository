import { Request, Response } from "express";
import { z } from "zod";
import * as authService from "../services/auth.service";
import { signToken } from "../utils/jwt.util";
import { success, error } from "../utils/response.util";

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be under 72 characters"), // bcrypt silently truncates at 72
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Cookie Config ────────────────────────────────────────────────────────────

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: "/",
};

// ─── Controllers ──────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    error(res, parsed.error.errors[0].message, 400);
    return;
  }

  try {
    const { name, email, password } = parsed.data;
    const user = await authService.register(name, email, password);
    const token = signToken(user.id, user.role);

    res.cookie("token", token, COOKIE_OPTIONS);
    success(res, user, "Account created successfully", 201);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      error(res, "An account with this email already exists", 409);
      return;
    }
    console.error("[auth.register]", err);
    error(res, "Registration failed. Please try again.", 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    error(res, parsed.error.errors[0].message, 400);
    return;
  }

  try {
    const { email, password } = parsed.data;
    const user = await authService.login(email, password);
    const token = signToken(user.id, user.role);

    res.cookie("token", token, COOKIE_OPTIONS);
    success(res, user, "Login successful");
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
      error(res, "Invalid email or password", 401);
      return;
    }
    console.error("[auth.login]", err);
    error(res, "Login failed. Please try again.", 500);
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie("token", { ...COOKIE_OPTIONS, maxAge: 0 });
  success(res, null, "Logged out successfully");
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is guaranteed by authMiddleware
    const user = await authService.getMe(req.user!.id);
    success(res, user, "User retrieved successfully");
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "USER_NOT_FOUND") {
      error(res, "User not found", 404);
      return;
    }
    console.error("[auth.getMe]", err);
    error(res, "Failed to retrieve user", 500);
  }
};
