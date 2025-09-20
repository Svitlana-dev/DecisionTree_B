import "dotenv/config"; // ← підхопити .env
import express from "express";
import cors from "cors";
import entriesRouter from "./src/routes/entries.js";

const app = express();

app.use(cors());
app.use(express.json());

// роутер з записами
app.use("/api/entries", entriesRouter);

// простий health
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ГЛОБАЛЬНИЙ error-handler (дасть зрозумілий 500)
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
