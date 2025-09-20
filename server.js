import "dotenv/config";
import express from "express";
import cors from "cors";

import entriesRouter from "./src/routes/entries.js";
import uploadRouter from "./src/routes/upload.js";

const app = express();

app.use(cors());
app.use(express.json());
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/entries", entriesRouter);
app.use("/api/upload", uploadRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
