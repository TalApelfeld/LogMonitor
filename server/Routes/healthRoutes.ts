import express from "express";

export const healthRouteer = express.Router();

healthRouteer.get("/", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});
