import express from "express";
import { authenticateToken, authorizeRoles } from "../utils/authToken";
import { sanitizeUsers } from "../Controllers/usersControllers";
export const usersRouter = express.Router();

usersRouter.get(
  "/",
  authenticateToken,
  authorizeRoles(["admin"]),
  sanitizeUsers
);
