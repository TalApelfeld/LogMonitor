import bcrypt from "bcryptjs";
import { Request, Response } from "express";
const users = [
  {
    id: "1",
    email: "admin@logmonitor.com",
    password: bcrypt.hashSync("admin123", 10),
    name: "Admin User",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "user@logmonitor.com",
    password: bcrypt.hashSync("user123", 10),
    name: "Regular User",
    role: "user",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    email: "tal@gmail.com",
    password: bcrypt.hashSync("123", 10),
    name: "Tal User",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
];

export async function sanitizeUsers(req: Request, res: Response) {
  const sanitizedUsers = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  }));

  res.json(sanitizedUsers);
}
