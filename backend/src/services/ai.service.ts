import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiOutput, AiType } from "@prisma/client";
import prisma from "../config/db";

// ─── Gemini client (lazy-initialised so missing key fails at call time) ───────

let _model: ReturnType<
  InstanceType<typeof GoogleGenerativeAI>["getGenerativeModel"]
> | null = null;

const getModel = () => {
  if (_model) return _model;
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  _model = new GoogleGenerativeAI(key).getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  return _model;
};

// ─── Thesis fetch helper ──────────────────────────────────────────────────────

const getThesisForAI = async (thesisId: string) => {
  const thesis = await prisma.thesis.findUnique({
    where: { id: thesisId },
    include: { author: { select: { name: true } } },
  });
  if (!thesis) throw new Error("THESIS_NOT_FOUND");
  return thesis;
};

// ─── Rate limit helpers ───────────────────────────────────────────────────────

export const checkUsageLimit = async (userId: string): Promise<void> => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const count = await prisma.aiUsage.count({
    where: { userId, usedAt: { gte: startOfDay } },
  });

  if (count >= 10) throw new Error("DAILY_LIMIT_REACHED");
};

export const getTodayUsageCount = async (userId: string): Promise<number> => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return prisma.aiUsage.count({
    where: { userId, usedAt: { gte: startOfDay } },
  });
};

export const recordUsage = async (
  userId: string,
  type: AiType
): Promise<void> => {
  await prisma.aiUsage.create({ data: { userId, type } });
};

// ─── Output upsert ────────────────────────────────────────────────────────────
// No unique constraint on (thesisId, type) in schema — use findFirst + update/create

export const saveOutput = async (
  thesisId: string,
  type: AiType,
  content: string
): Promise<AiOutput> => {
  const existing = await prisma.aiOutput.findFirst({
    where: { thesisId, type },
  });

  if (existing) {
    return prisma.aiOutput.update({
      where: { id: existing.id },
      // Refresh createdAt so the "Generated on" timestamp reflects the latest run
      data: { content, createdAt: new Date() },
    });
  }

  return prisma.aiOutput.create({ data: { thesisId, type, content } });
};

// ─── Fetch saved outputs ──────────────────────────────────────────────────────

export const getAiOutputs = async (thesisId: string): Promise<AiOutput[]> => {
  return prisma.aiOutput.findMany({
    where: { thesisId },
    orderBy: { createdAt: "desc" },
  });
};

// ─── Gemini call wrapper ──────────────────────────────────────────────────────

const callGemini = async (prompt: string): Promise<string> => {
  const result = await getModel().generateContent(prompt);
  return result.response.text().trim();
};

// ─── AI Generation Methods ────────────────────────────────────────────────────

export const generateSummary = async (
  thesisId: string,
  userId: string
): Promise<AiOutput> => {
  await checkUsageLimit(userId);

  const thesis = await getThesisForAI(thesisId);
  const text = thesis.extractedText?.slice(0, 3000) || thesis.abstract;
  if (!text?.trim()) throw new Error("NO_CONTENT_AVAILABLE");

  const prompt = `You are an academic research assistant. Summarize the following thesis in exactly 3 paragraphs. Cover:
paragraph 1 — the problem and motivation,
paragraph 2 — methodology and approach,
paragraph 3 — key findings and conclusions.
Keep language formal and academic.

Thesis text: ${text}`;

  const content = await callGemini(prompt);
  const output = await saveOutput(thesisId, AiType.SUMMARY, content);
  await recordUsage(userId, AiType.SUMMARY);
  return output;
};

export const generateAbstract = async (
  thesisId: string,
  userId: string
): Promise<AiOutput> => {
  await checkUsageLimit(userId);

  const thesis = await getThesisForAI(thesisId);
  const text = thesis.extractedText?.slice(0, 3000) || thesis.abstract;
  if (!text?.trim()) throw new Error("NO_CONTENT_AVAILABLE");

  const prompt = `Write a formal academic abstract (150–250 words) for the following thesis. Structure: background, objective, methodology, results, conclusion. Use passive voice where appropriate. Output the abstract only, no labels.

Thesis text: ${text}`;

  const content = await callGemini(prompt);
  const output = await saveOutput(thesisId, AiType.ABSTRACT, content);
  await recordUsage(userId, AiType.ABSTRACT);
  return output;
};

export const suggestTitles = async (
  thesisId: string,
  userId: string
): Promise<AiOutput> => {
  await checkUsageLimit(userId);

  const thesis = await getThesisForAI(thesisId);
  const text = thesis.extractedText?.slice(0, 2000) || thesis.abstract;
  if (!text?.trim()) throw new Error("NO_CONTENT_AVAILABLE");

  const prompt = `Based on the following thesis content, suggest exactly 5 alternative academic titles. Each title must be under 15 words, specific, and reflect the core contribution. Format your response as a numbered list (1. 2. 3. 4. 5.) with no extra commentary.

Thesis text: ${text}`;

  const content = await callGemini(prompt);
  const output = await saveOutput(thesisId, AiType.TITLE_SUGGESTION, content);
  await recordUsage(userId, AiType.TITLE_SUGGESTION);
  return output;
};

export const formatCitation = async (
  thesisId: string,
  userId: string
): Promise<AiOutput> => {
  await checkUsageLimit(userId);

  const thesis = await getThesisForAI(thesisId);

  const prompt = `Generate an APA 7th edition citation for an unpublished thesis with the following details:
Title: ${thesis.title}
Author: ${thesis.author.name}
Year: ${thesis.year ?? "n.d."}
Institution: University (not specified)
Output only the formatted citation. No explanation.`;

  const content = await callGemini(prompt);
  const output = await saveOutput(thesisId, AiType.CITATION, content);
  await recordUsage(userId, AiType.CITATION);
  return output;
};

export const suggestRelatedStudies = async (
  thesisId: string,
  userId: string
): Promise<AiOutput> => {
  await checkUsageLimit(userId);

  const thesis = await getThesisForAI(thesisId);
  const baseText =
    thesis.abstract || thesis.extractedText?.slice(0, 500);
  if (!baseText?.trim()) throw new Error("NO_CONTENT_AVAILABLE");

  const prompt = `Based on the following thesis abstract, suggest exactly 5 related research topics a student should explore. For each, provide: (1) the topic name and (2) one sentence explaining its relevance. Format as a numbered list.

Abstract: ${baseText}`;

  const content = await callGemini(prompt);
  const output = await saveOutput(thesisId, AiType.RELATED_STUDIES, content);
  await recordUsage(userId, AiType.RELATED_STUDIES);
  return output;
};
