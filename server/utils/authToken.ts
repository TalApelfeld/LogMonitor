// utils/authToken.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface TokenUser extends JwtPayload {
  id: string;
  role: string;
}

type AuthRequest = Request & { user?: TokenUser };

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    // now TS knows req.user exists and is TokenUser
    req.user = decoded as TokenUser;
    next();
  });
};

export function authorizeRoles(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // req.user is typed, so req.user.role is OK
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}
