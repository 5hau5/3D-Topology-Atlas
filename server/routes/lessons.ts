import express from "express";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import Ajv from "ajv";
import { nanoid } from "nanoid";

import lessonSchema from "../../src/schema/lesson.schema.json";

const router = express.Router();

// ---------------------------
// Globals
// ---------------------------
const LESSONS_ROOT = path.resolve(__dirname, "../../public/lessons");
const INDEX_PATH = path.join(LESSONS_ROOT, "index.json");

// In-memory dictionary (auto-loaded on startup)
let LESSON_INDEX: Record<string, { id: string; title: string; filename: string }> = {};

function loadIndex() {
  try {
    LESSON_INDEX = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
  } catch {
    LESSON_INDEX = {};
  }
}

function saveIndex() {
  fs.writeFileSync(INDEX_PATH, JSON.stringify(LESSON_INDEX, null, 2));
}

// Load at startup
loadIndex();

// ---------------------------
// Utils
// ---------------------------
function makeFilename(title: string, id: string) {
  const safe = title.trim().replace(/\s+/g, "_");
  return `${safe}_${id}.json`;
}

// ---------------------------
// AJV setup
// ---------------------------
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(lessonSchema);

// ---------------------------
// GET /api/lessons/list
// ---------------------------
router.get("/list", (req, res) => {
  res.json(Object.values(LESSON_INDEX));
});

// ---------------------------
// GET /api/lessons/:id
// ---------------------------
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const entry = LESSON_INDEX[id];
  if (!entry) return res.status(404).json({ error: "Lesson not found" });

  const filePath = path.join(LESSONS_ROOT, entry.filename);
  const data = JSON.parse(await fsp.readFile(filePath, "utf8"));

  res.json(data);
});

// ---------------------------
// POST /api/lessons/save
// ---------------------------
router.post("/save", express.json({ limit: "100mb" }), async (req, res) => {
  const lesson = req.body;

  if (!lesson.meta.id) lesson.meta.id = nanoid(10);

  if (!validate(lesson)) {
    return res.status(400).json({ error: "Invalid JSON", details: validate.errors });
  }

  const filename = makeFilename(lesson.meta.title, lesson.meta.id);
  const filePath = path.join(LESSONS_ROOT, filename);

  await fsp.writeFile(filePath, JSON.stringify(lesson, null, 2));

  // Update index
  LESSON_INDEX[lesson.meta.id] = {
    id: lesson.meta.id,
    title: lesson.meta.title,
    filename
  };

  saveIndex();

  res.json({ success: true, id: lesson.meta.id });
});

// ---------------------------
// DELETE /api/lessons/delete/:id
// ---------------------------
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  const entry = LESSON_INDEX[id];
  if (!entry) return res.status(404).json({ error: "Lesson not found" });

  const filePath = path.join(LESSONS_ROOT, entry.filename);
  await fsp.unlink(filePath);

  delete LESSON_INDEX[id];
  saveIndex();

  res.json({ success: true });
});

export default router;
