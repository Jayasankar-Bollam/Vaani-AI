import mongoose from "mongoose";

const questionSub = new mongoose.Schema({
  text: String, category: String, topic: String, subtopic: String,
  difficulty: String, skill: String, estimatedTime: Number,
  reason: String, embedding: [Number], isVerification: Boolean,
});

const answerSub = new mongoose.Schema({
  questionIndex: Number, text: String, evaluation: Object, createdAt: { type: Date, default: Date.now },
});

const interviewSchema = new mongoose.Schema({
  candidate: {
    name: String, degree: String, branch: String, year: String,
    targetCompany: String, targetRole: String,
    skills: [String], projects: [{ title: String, description: String }],
    experience: String,
  },
  status: { type: String, default: "active" },
  difficulty: { type: String, default: "Easy" },
  skillScores: { type: Object, default: {} },
  recentScores: { type: [Number], default: [] },
  difficultyHistory: { type: [String], default: [] },
  questions: [questionSub],
  answers: [answerSub],
  report: Object,
}, { timestamps: true });

export default mongoose.model("Interview", interviewSchema);