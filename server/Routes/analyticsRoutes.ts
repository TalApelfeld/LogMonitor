import express from "express";
import { authenticateToken, authorizeRoles } from "../utils/authToken";
import { getAnalytics } from "../Controllers/analyticsControllers";

export const analyticsRouter = express.Router();

analyticsRouter.get(
  "/",
  authenticateToken,
  authorizeRoles(["admin", "user"]),
  getAnalytics
);
