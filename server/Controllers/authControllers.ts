import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { pg } from "../postgresDB/db";

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// const users = [
//   {
//     id: "1",
//     email: "admin@logmonitor.com",
//     password: bcrypt.hashSync("admin123", 10),
//     name: "Admin User",
//     role: "admin",
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: "2",
//     email: "user@logmonitor.com",
//     password: bcrypt.hashSync("user123", 10),
//     name: "Regular User",
//     role: "user",
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: "3",
//     email: "tal@gmail.com",
//     password: bcrypt.hashSync("123", 10),
//     name: "Tal User",
//     role: "user",
//     createdAt: new Date().toISOString(),
//   },
// ];

export async function registerUser(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "email, password, and name are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert and rely on unique(email) to prevent duplicates
    const result = await pg.query(
      `
  INSERT INTO users (email, password, name, role)
  VALUES ($1, $2, $3, 'user')
  ON CONFLICT (email) DO NOTHING
  RETURNING id, email, name, role, createdat AS "createdAt"
  `,
      [email, hashedPassword, name]
    );

    // If no row was returned, user already exists
    if (result.rowCount === 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    console.error("registerUser error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    // fetch user (including hashed password)
    const result = await pg.query<{
      id: string;
      email: string;
      password: string;
      name: string;
      role: string;
      createdAt: string;
    }>(
      `SELECT id, email, password, name, role, createdat AS "createdAt"
   FROM users
   WHERE email = $1
   LIMIT 1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const dbUser = result.rows[0] as User;
    const ok = await bcrypt.compare(password, dbUser.password);
    if (!ok) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: dbUser.id, email: dbUser.email, role: dbUser.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // exclude password from response
    const { password: _omit, ...user } = dbUser;

    return res.json({ token, user });
  } catch (err) {
    console.error("loginUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
