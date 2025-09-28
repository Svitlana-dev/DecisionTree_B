import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import entriesRouter from "./src/routes/entries.js";
import uploadRouter from "./src/routes/upload.js";
import authRouter from "./src/routes/auth.js";
import { requireAuth } from "./src/middleware/auth.js";

const app = express();

const ALLOWED = (
  process.env.CORS_ORIGIN || "https://decision-tree-six.vercel.app"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || ALLOWED.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/entries", requireAuth, entriesRouter);
app.use("/api/upload", requireAuth, uploadRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`API listening on http://localhost:${PORT}`)
);
