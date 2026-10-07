import { Router } from "express";

import Interview from "../models/Interview.js";

import { askLLM, embed } from "../services/llm.js";

import {
  evaluationSchema,
  questionSchema,
} from "../schemas.js";

import { evaluatePrompt } from "../prompts/evaluate.js";

import { generatePrompt } from "../prompts/generateQuestion.js";

import {
  updateSkill,
  nextDifficulty,
  decideNext,
} from "../services/engine.js";

import { checkDuplicate } from "../services/similarity.js";

import { buildReport } from "../services/report.js";

const router = Router();

const MAX_QUESTIONS = 10;

// -----------------------------------------
// FALLBACK EVALUATION
// -----------------------------------------

const neutralEval = {
  overall_score: 5,
  technical_accuracy: 5,
  relevance: 5,
  communication: 5,
  clarity: 5,
  depth: 5,
  strengths: [],
  weaknesses: [
    "Could not evaluate automatically",
  ],
  claims: [],
  follow_up_required: false,
};

// -----------------------------------------
// FALLBACK QUESTIONS
// -----------------------------------------

const getFallbackQuestions = (plan) => [
  {
    next_question:
      "Tell me about a technical challenge you solved recently.",
    category: "Technical",
    topic: "Problem Solving",
    subtopic: "Technical Challenges",
    difficulty: plan.difficulty || "Easy",
    skill: "Problem Solving",
    estimated_time_min: 3,
    reason: "Fallback question",
  },

  {
    next_question:
      "Explain a project you are particularly proud of and your contribution to it.",
    category: "Project",
    topic: "Projects",
    subtopic: "Project Contribution",
    difficulty: plan.difficulty || "Easy",
    skill: "Project Experience",
    estimated_time_min: 3,
    reason: "Fallback question",
  },

  {
    next_question:
      "How would you design a REST API for a task management application?",
    category: "Technical",
    topic: "Backend Development",
    subtopic: "REST APIs",
    difficulty: plan.difficulty || "Medium",
    skill: "Backend Development",
    estimated_time_min: 4,
    reason: "Fallback question",
  },

  {
    next_question:
      "What is the difference between SQL and NoSQL databases, and when would you choose MongoDB?",
    category: "Technical",
    topic: "Databases",
    subtopic: "SQL vs NoSQL",
    difficulty: plan.difficulty || "Easy",
    skill: "Database",
    estimated_time_min: 3,
    reason: "Fallback question",
  },

  {
    next_question:
      "How does authentication work in a MERN stack application?",
    category: "Technical",
    topic: "Authentication",
    subtopic: "JWT Authentication",
    difficulty: plan.difficulty || "Medium",
    skill: "Security",
    estimated_time_min: 3,
    reason: "Fallback question",
  },

  {
    next_question:
      "What steps would you take to improve the performance of a React application?",
    category: "Technical",
    topic: "React",
    subtopic: "Performance Optimization",
    difficulty: plan.difficulty || "Medium",
    skill: "React",
    estimated_time_min: 3,
    reason: "Fallback question",
  },

  {
    next_question:
      "Explain how Node.js handles multiple requests even though JavaScript runs on a single thread.",
    category: "Technical",
    topic: "Node.js",
    subtopic: "Event Loop",
    difficulty: plan.difficulty || "Medium",
    skill: "Node.js",
    estimated_time_min: 4,
    reason: "Fallback question",
  },

  {
    next_question:
      "What is the purpose of middleware in Express.js?",
    category: "Technical",
    topic: "Express.js",
    subtopic: "Middleware",
    difficulty: plan.difficulty || "Easy",
    skill: "Express.js",
    estimated_time_min: 3,
    reason: "Fallback question",
  },

  {
    next_question:
      "How would you prevent duplicate API requests from creating duplicate records in MongoDB?",
    category: "ProblemSolving",
    topic: "Backend",
    subtopic: "Idempotency",
    difficulty: plan.difficulty || "Hard",
    skill: "System Design",
    estimated_time_min: 4,
    reason: "Fallback question",
  },

  {
    next_question:
      "How would you design a scalable application that can handle thousands of users simultaneously?",
    category: "ProblemSolving",
    topic: "System Design",
    subtopic: "Scalability",
    difficulty: plan.difficulty || "Hard",
    skill: "System Design",
    estimated_time_min: 5,
    reason: "Fallback question",
  },
];

// -----------------------------------------
// CHECK GEMINI QUOTA ERROR
// -----------------------------------------

const isQuotaError = (error) => {
  const message =
    error?.message?.toLowerCase() || "";

  return (
    error?.status === 429 ||
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("too many requests") ||
    message.includes("rate limit")
  );
};

// -----------------------------------------
// GET UNIQUE FALLBACK QUESTION
// -----------------------------------------

function getUniqueFallbackQuestion(
  interview,
  plan
) {
  const fallbackQuestions =
    getFallbackQuestions(plan);

  const askedTexts = new Set(
    interview.questions.map((q) =>
      q.text?.trim()
    )
  );

  const availableQuestions =
    fallbackQuestions.filter(
      (q) =>
        !askedTexts.has(
          q.next_question.trim()
        )
    );

  // Return an unused fallback question
  if (availableQuestions.length > 0) {
    return availableQuestions[0];
  }

  // This should only happen if more than
  // 10 fallback questions are required.
  return fallbackQuestions[
    Math.floor(
      Math.random() *
        fallbackQuestions.length
    )
  ];
}

// -----------------------------------------
// GENERATE QUESTION
// -----------------------------------------

async function makeQuestion(
  interview,
  plan
) {
  const asked = interview.questions;

  for (let i = 0; i < 3; i++) {
    try {
      console.log(
        `Generating interview question - attempt ${
          i + 1
        }/3`
      );

      const q = await askLLM(
        generatePrompt(
          plan,
          interview.candidate,
          asked.map((a) => a.text)
        ),
        questionSchema,
        null
      );

      // -----------------------------------------
      // GEMINI FAILED
      // -----------------------------------------

      if (!q) {
        console.warn(
          "Gemini unavailable. Using unique fallback question."
        );

        const fallback =
          getUniqueFallbackQuestion(
            interview,
            plan
          );

        return {
          q: fallback,
          embedding: [],
        };
      }

      // -----------------------------------------
      // NORMALIZE GEMINI RESPONSE
      // -----------------------------------------

      const normalizedQuestion = {
        ...q,
      };

      if (
        !normalizedQuestion.next_question
      ) {
        console.warn(
          "Gemini returned an invalid question. Retrying..."
        );

        continue;
      }

      // -----------------------------------------
      // EMBEDDING
      // -----------------------------------------

      let embedding = [];

      try {
        embedding = await embed(
          normalizedQuestion.next_question
        );

        if (!embedding) {
          embedding = [];
        }
      } catch (embeddingError) {
        console.error(
          "Embedding failed:",
          embeddingError.message
        );

        embedding = [];
      }

      // -----------------------------------------
      // DUPLICATE CHECK
      // -----------------------------------------

      if (embedding.length > 0) {
        const duplicateResult =
          checkDuplicate(
            normalizedQuestion.next_question,
            embedding,
            asked
          );

        if (duplicateResult !== "ok") {
          console.warn(
            "Duplicate Gemini question detected. Retrying..."
          );

          continue;
        }
      }

      // -----------------------------------------
      // VALID GEMINI QUESTION
      // -----------------------------------------

      return {
        q: normalizedQuestion,
        embedding,
      };
    } catch (error) {
      console.error(
        `Question generation attempt ${
          i + 1
        } failed:`,
        error.message
      );

      // -----------------------------------------
      // GEMINI QUOTA / RATE LIMIT
      // -----------------------------------------

      if (isQuotaError(error)) {
        console.warn(
          "Gemini quota/rate limit exceeded."
        );

        const fallback =
          getUniqueFallbackQuestion(
            interview,
            plan
          );

        return {
          q: fallback,
          embedding: [],
        };
      }

      // -----------------------------------------
      // LAST ATTEMPT FAILED
      // -----------------------------------------

      if (i === 2) {
        console.warn(
          "All question-generation attempts failed."
        );

        const fallback =
          getUniqueFallbackQuestion(
            interview,
            plan
          );

        return {
          q: fallback,
          embedding: [],
        };
      }

      // -----------------------------------------
      // RETRY DELAY
      // -----------------------------------------

      await new Promise((resolve) =>
        setTimeout(
          resolve,
          1000 * (i + 1)
        )
      );
    }
  }

  // -----------------------------------------
  // FINAL FALLBACK
  // -----------------------------------------

  const fallback =
    getUniqueFallbackQuestion(
      interview,
      plan
    );

  return {
    q: fallback,
    embedding: [],
  };
}

// -----------------------------------------
// CONVERT QUESTION TO MONGODB DOCUMENT
// -----------------------------------------

const toDoc = (
  { q, embedding },
  plan
) => ({
  text: q.next_question,
  category: q.category,
  topic: q.topic,
  subtopic: q.subtopic,
  difficulty: q.difficulty,
  skill: q.skill,
  estimatedTime: q.estimated_time_min,
  reason: q.reason || plan.reason,
  embedding: embedding || [],
  isVerification:
    plan.mode === "verify_claim",
});

// -----------------------------------------
// 1. START INTERVIEW
// -----------------------------------------

router.post("/start", async (req, res) => {
  try {
    const interview =
      await Interview.create({
        candidate: req.body,
      });

    interview.skillScores =
      Object.fromEntries(
        (req.body.skills || []).map(
          (s) => [s, 5]
        )
      );

    interview.markModified(
      "skillScores"
    );

    const plan = {
      mode: "intro",
      topic: "Introduction",
      difficulty: "Easy",
      reason: "Opening question",
    };

    const question =
      await makeQuestion(
        interview,
        plan
      );

    interview.questions.push(
      toDoc(question, plan)
    );

    interview.difficultyHistory.push(
      "Easy"
    );

    await interview.save();

    res.json({
      id: interview._id,
      question:
        interview.questions[0],
    });
  } catch (error) {
    console.error(
      "START INTERVIEW ERROR:",
      error
    );

    res.status(500).json({
      error:
        error.message ||
        "Failed to start interview",
    });
  }
});

// -----------------------------------------
// 2. ANSWER
// -----------------------------------------

router.post(
  "/:id/answer",
  async (req, res) => {
    try {
      const interview =
        await Interview.findById(
          req.params.id
        );

      if (!interview) {
        return res.status(404).json({
          error:
            "Interview not found",
        });
      }

      const idx =
        interview.questions.length - 1;

      const lastQ =
        interview.questions[idx];

      // -----------------------------------------
      // EVALUATE ANSWER
      // -----------------------------------------

      let evaluation;

      try {
        evaluation = await askLLM(
          evaluatePrompt(
            lastQ,
            req.body.answer,
            interview.candidate
          ),
          evaluationSchema,
          neutralEval
        );

        evaluation =
          evaluation || neutralEval;
      } catch (error) {
        console.error(
          "Evaluation failed:",
          error.message
        );

        evaluation = neutralEval;
      }

      // -----------------------------------------
      // SAVE ANSWER
      // -----------------------------------------

      interview.answers.push({
        questionIndex: idx,
        text: req.body.answer,
        evaluation,
      });

      // -----------------------------------------
      // UPDATE SKILLS
      // -----------------------------------------

      const scores = {
        ...interview.skillScores,
      };

      updateSkill(
        scores,
        lastQ.skill,
        evaluation.overall_score
      );

      interview.skillScores =
        scores;

      interview.markModified(
        "skillScores"
      );

      // -----------------------------------------
      // UPDATE SCORE HISTORY
      // -----------------------------------------

      interview.recentScores.push(
        evaluation.overall_score
      );

      // -----------------------------------------
      // UPDATE DIFFICULTY
      // -----------------------------------------

      interview.difficulty =
        nextDifficulty(
          interview.difficulty,
          interview.recentScores
        );

      interview.difficultyHistory.push(
        interview.difficulty
      );

      // -----------------------------------------
      // INTERVIEW COMPLETED
      // -----------------------------------------

      if (
        interview.questions.length >=
        MAX_QUESTIONS
      ) {
        interview.status =
          "completed";

        try {
          interview.report =
            await buildReport(
              interview
            );
        } catch (reportError) {
          console.error(
            "REPORT GENERATION ERROR:",
            reportError.message
          );

          interview.report = null;
        }

        await interview.save();

        return res.json({
          done: true,
          evaluation,
          report:
            interview.report,
        });
      }

      // -----------------------------------------
      // DECIDE NEXT QUESTION
      // -----------------------------------------

      const plan = decideNext({
        evaluation,
        lastQuestion: lastQ,
        skills: scores,
        askedTopics:
          interview.questions.map(
            (q) => q.skill
          ),
        difficulty:
          interview.difficulty,
      });

      // -----------------------------------------
      // GENERATE NEXT QUESTION
      // -----------------------------------------

      const nextQuestion =
        await makeQuestion(
          interview,
          plan
        );

      interview.questions.push(
        toDoc(
          nextQuestion,
          plan
        )
      );

      await interview.save();

      res.json({
        done: false,
        evaluation,
        question:
          interview.questions.at(-1),
      });
    } catch (error) {
      console.error(
        "ANSWER INTERVIEW ERROR:",
        error
      );

      res.status(500).json({
        error:
          error.message ||
          "Failed to process answer",
      });
    }
  }
);

// -----------------------------------------
// 3. GET INTERVIEW
// -----------------------------------------

router.get(
  "/:id",
  async (req, res) => {
    try {
      const interview =
        await Interview.findById(
          req.params.id
        ).select(
          "-questions.embedding"
        );

      if (!interview) {
        return res.status(404).json({
          error:
            "Interview not found",
        });
      }

      res.json(interview);
    } catch (error) {
      console.error(
        "GET INTERVIEW ERROR:",
        error
      );

      res.status(500).json({
        error:
          "Failed to fetch interview",
      });
    }
  }
);

export default router;