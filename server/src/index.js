import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import interviewRoutes from "./routes/interview.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "VAANI AI Backend is running ",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "VAANI AI API is healthy",
  });
});

app.use("/api/interview", interviewRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });