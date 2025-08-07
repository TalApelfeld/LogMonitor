import express from "express";
import { loginUser, registerUser } from "../Controllers/authControllers";
import { authenticateToken } from "../utils/authToken";

export const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/verifyToken", authenticateToken);
