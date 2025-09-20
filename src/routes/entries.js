import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../lib/mongo.js";

const r = Router();

r.get("/", async (req, res, next) => {
  try {
    const db = await getDb();
    const list = await db
      .collection("entries")
      .find({})
      .sort({ _id: -1 })
      .toArray();
    res.json(list);
  } catch (e) {
    next(e);
  }
});

r.post("/", async (req, res, next) => {
  try {
    const {
      fields = [],
      note = "",
      screenshotUrl = null,
      screenshotPublicId = null,
    } = req.body || {};

    if (!Array.isArray(fields) || fields.length === 0) {
      return res
        .status(400)
        .json({ message: "fields має бути непорожнім масивом" });
    }

    const doc = {
      fields,
      note,
      screenshotUrl,
      screenshotPublicId,
      createdAt: new Date().toISOString(),
    };

    const db = await getDb();
    const { insertedId } = await db.collection("entries").insertOne(doc);
    res.status(201).json({ ...doc, _id: insertedId });
  } catch (e) {
    next(e);
  }
});

r.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Невалідний id" });
    }
    const db = await getDb();
    const result = await db
      .collection("entries")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Запис не знайдено" });
    }
    return res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

r.delete("/", async (req, res, next) => {
  try {
    const db = await getDb();
    await db.collection("entries").deleteMany({});
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

export default r;
