import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import interviewRoutes from "./routes/interview.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/interview", interviewRoutes);

await mongoose.connect(process.env.MONGO_URI);
app.listen(process.env.PORT, () => console.log("Server running"));