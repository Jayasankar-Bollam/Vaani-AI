import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import interviewRoutes from "./routes/interview.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "VAANI AI Backend is running 🚀"
  });
});

// API routes
app.use("/api/interview", interviewRoutes);

// Database connection
await mongoose.connect(process.env.MONGO_URI);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});