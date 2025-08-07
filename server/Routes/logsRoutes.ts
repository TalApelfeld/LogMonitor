import express from "express";
import multer from "multer";
import {
  createLog,
  getLogsFromIndex,
  ingestLogEntry,
  searchLogsInIndex,
  uploadLogsFromFile,
} from "../Controllers/logsControllers";
import { authenticateToken, authorizeRoles } from "../utils/authToken";

const upload = multer({ storage: multer.memoryStorage() });
export const logsRouter = express.Router();

logsRouter
  .get("/", authenticateToken, getLogsFromIndex)
  .post("/", authenticateToken, authorizeRoles(["admin", "user"]), createLog);

logsRouter.get("/search", authenticateToken, searchLogsInIndex);

logsRouter.post("/upload", upload.single("logfile"), uploadLogsFromFile);

logsRouter.post("/ingest", upload.single("logfile"), ingestLogEntry);
