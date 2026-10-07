import { askLLM } from "./llm.js";
import { z } from "zod";

const catMap = { Intro: "Communication", Technical: "Technical Knowledge", Project: "Project Understanding",
  ProblemSolving: "Problem Solving", Behavioral: "Behavioral" };

export async function buildReport(interview) {
  const buckets = {};
  interview.questions.forEach((q, i) => {
    const a = interview.answers[i]; if (!a) return;
    const name = catMap[q.category];
    (buckets[name] ||= []).push(a.evaluation.overall_score * 10);
  });
  const avg = arr => Math.round(arr.reduce((s, x) => s + x, 0) / arr.length);
  const areas = Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, avg(v)]));

  const comm = interview.answers.map(a => a.evaluation.communication * 10);
  areas["Communication"] = avg(comm);

  const weights = { "Technical Knowledge": .3, "Problem Solving": .2, "Communication": .15,
    "Project Understanding": .2, "Behavioral": .15 };
  let total = 0, w = 0;
  for (const [k, wt] of Object.entries(weights)) if (areas[k] != null) { total += areas[k] * wt; w += wt; }
  const overall = Math.round(total / w);

  const recommendation = overall >= 85 ? "Strong Candidate" : overall >= 70 ? "Placement Ready"
    : overall >= 50 ? "Developing" : "Needs Improvement";

  const textSchema = z.object({ strengths: z.array(z.string()), improvements: z.array(z.string()),
    recommended_learning: z.array(z.string()) });
  const feedback = await askLLM(
    `Based on these interview results, return ONLY JSON with strengths, improvements, recommended_learning (arrays of short strings).
Skill scores: ${JSON.stringify(interview.skillScores)}
Area scores: ${JSON.stringify(areas)}
Weaknesses seen: ${interview.answers.flatMap(a => a.evaluation.weaknesses).join("; ")}`,
    textSchema, { strengths: [], improvements: [], recommended_learning: [] });

  return { areas, overall, recommendation, ...feedback };
}