// src/routes/entries.js (або твій шлях)
import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../lib/mongo.js";

const r = Router();

// які з полів вважаємо «тригером», якщо його не передали окремо
const ROOT_CATEGORIES = new Set(["Фрактал", "IMB", "OB"]);

// helper: безпечне приведення до рядка
const toStr = (v) => (v === undefined || v === null ? "" : String(v).trim());

r.get("/", async (req, res, next) => {
  try {
    const db = await getDb();
    const list = await db
      .collection("entries")
      .find({ ownerId: new ObjectId(req.user.id) })
      .sort({ _id: -1 }) // найновіші зверху
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

      // нові поля з фронта
      coin = "",
      trigger = "",
      rr = "",
    } = req.body || {};

    if (!Array.isArray(fields) || fields.length === 0) {
      return res
        .status(400)
        .json({ message: "fields має бути непорожнім масивом" });
    }

    // тригер з тіла або перший кореневий вибір із fields
    const triggerFromFields = fields.find((x) => ROOT_CATEGORIES.has(x)) || "";
    const normalized = {
      coin: toStr(coin),
      trigger: toStr(trigger) || triggerFromFields,
      rr: toStr(rr), // тримаємо як рядок, щоб не ловити “8,8” vs “8.8”
    };

    const doc = {
      ownerId: new ObjectId(req.user.id),
      fields,
      note,
      screenshotUrl,
      screenshotPublicId,
      ...normalized,
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
      .deleteOne({ _id: new ObjectId(id), ownerId: new ObjectId(req.user.id) });

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
    await db
      .collection("entries")
      .deleteMany({ ownerId: new ObjectId(req.user.id) });
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

export default r;
