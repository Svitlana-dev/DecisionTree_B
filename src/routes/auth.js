import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDb } from "../lib/mongo.js";

const r = Router();

const issueToken = (userId) =>
  jwt.sign({}, process.env.JWT_SECRET, {
    subject: String(userId),
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });

r.post("/register", async (req, res, next) => {
  try {
    const { email, password, name = "" } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "Email і пароль обовʼязкові" });

    const db = await getDb();
    await db
      .collection("users")
      .createIndex({ email: 1 }, { unique: true })
      .catch(() => {});

    const exists = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(409).json({ message: "Email вже використовується" });

    const passwordHash = await bcrypt.hash(password, 12);
    const userDoc = {
      email: email.toLowerCase(),
      passwordHash,
      name,
      createdAt: new Date().toISOString(),
    };
    const { insertedId } = await db.collection("users").insertOne(userDoc);

    const token = issueToken(insertedId);
    res.status(201).json({ id: insertedId, email: userDoc.email, name, token });
  } catch (e) {
    if (e.code === 11000)
      return res.status(409).json({ message: "Email вже використовується" });
    next(e);
  }
});

r.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const db = await getDb();
    const user = await db
      .collection("users")
      .findOne({ email: (email || "").toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(password || "", user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = issueToken(user._id);
    res.json({ id: user._id, email: user.email, name: user.name || "", token });
  } catch (e) {
    next(e);
  }
});

r.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.json(null);

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const db = await getDb();
    const u = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(payload.sub) },
        { projection: { email: 1, name: 1 } }
      );
    res.json(u ? { id: u._id, email: u.email, name: u.name || "" } : null);
  } catch {
    res.json(null);
  }
});

r.post("/logout", (_req, res) => res.json({ ok: true }));

export default r;
