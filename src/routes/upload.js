import { Router } from "express";
import multer from "multer";
import { uploadBufferToCloudinary } from "../lib/cloudinary.js";

const r = Router();
const upload = multer({ storage: multer.memoryStorage() });

r.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "no_file" });
    const { url, public_id } = await uploadBufferToCloudinary(
      req.file.buffer,
      req.file.originalname
    );
    res.json({ url, public_id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "upload_failed" });
  }
});

r.get("/ping", (req, res) => {
  res.json({ ok: true, route: "upload" });
});

export default r;
