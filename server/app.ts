import express from "express";
import cors from "cors";
import { authRouter } from "./Routes/authRoutes";
import { logsRouter } from "./Routes/logsRoutes";
import { analyticsRouter } from "./Routes/analyticsRoutes";
import { usersRouter } from "./Routes/usersRoutes";
export const app = express();

//// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/logs", logsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/users", usersRouter);
app.use("/api/health", usersRouter);
