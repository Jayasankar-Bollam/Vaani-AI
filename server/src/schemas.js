import { z } from "zod";

// -----------------------------------------
// EVALUATION SCHEMA
// -----------------------------------------

export const evaluationSchema = z.object({
  overall_score: z
    .number()
    .min(0)
    .max(10),

  technical_accuracy: z
    .number()
    .min(0)
    .max(10),

  relevance: z
    .number()
    .min(0)
    .max(10),

  communication: z
    .number()
    .min(0)
    .max(10),

  clarity: z
    .number()
    .min(0)
    .max(10),

  depth: z
    .number()
    .min(0)
    .max(10),

  strengths: z
    .array(z.string())
    .default([]),

  weaknesses: z
    .array(z.string())
    .default([]),

  claims: z
    .array(z.string())
    .default([]),

  follow_up_required: z
    .boolean()
    .default(false),
});

// -----------------------------------------
// QUESTION SCHEMA
// -----------------------------------------

export const questionSchema = z.object({
  next_question: z
    .string()
    .min(10),

  category: z.enum([
    "Intro",
    "Technical",
    "Project",
    "ProblemSolving",
    "Behavioral",
  ]),

  topic: z
    .string()
    .min(1),

  subtopic: z
    .string()
    .min(1),

  difficulty: z.enum([
    "Easy",
    "Medium",
    "Hard",
  ]),

  skill: z
    .string()
    .min(1),

  estimated_time_min: z
    .number()
    .min(1)
    .max(30),

  reason: z
    .string()
    .min(1),
});