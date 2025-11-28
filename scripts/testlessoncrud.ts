import path from "path";
import fs from "fs/promises";
import { nanoid } from "nanoid";
import {
  loadLesson,
  saveLessonToServer,
  deleteLesson,
  Lesson,
  LessonStep,
  LessonAsset,
} from "../src/LessonStuff";

// --- CONFIG ---
const scriptsDir = __dirname;
const assetsDir = scriptsDir; // cube.glb and sphere.glb are in the same folder
const args = process.argv.slice(2);

function hasFlag(flag: string) {
  return args.includes(flag);
}

// --- Helper: create a new lesson with cube & sphere assets ---
async function createTestLesson(title: string): Promise<Lesson> {
  const assetFiles = ["cube.glb", "sphere.glb"];

  const steps: LessonStep[] = [];
  for (let i = 0; i < assetFiles.length; i++) {
    const filePath = path.join(assetsDir, assetFiles[i]);
    const data = await fs.readFile(filePath);
    const base64 = `data:model/gltf-binary;base64,${data.toString("base64")}`;
    const asset: LessonAsset = {
      name: `asset_${i + 1}_${assetFiles[i].split(".")[0]}`,
      file_data: base64,
      type: "glb",
    };
    steps.push({
      description: `Step ${i + 1} for ${title}`,
      asset,
    });
  }

  const lesson: Lesson = {
    meta: {
      id: nanoid(10),
      title,
      author: "Test Script",
      version: "1.0",
      created_at: new Date().toISOString(),
    },
    steps,
  };

  return lesson;
}

// --- Helper: list lessons from index.json ---
async function listLessons(): Promise<any[]> {
  const indexFile = path.resolve(__dirname, "../public/lessons/index.json");
  try {
    const data = await fs.readFile(indexFile, "utf8");
    const index = JSON.parse(data);
    return Object.values(index);
  } catch (err) {
    console.warn("No index file found. Returning empty list.");
    return [];
  }
}

// --- MAIN TEST SCRIPT ---
async function main() {
  // --- CREATE ---
  if (hasFlag("--create")) {
    const lesson = await createTestLesson("Test Lesson");
    const result = await saveLessonToServer(lesson);
    console.log("CREATE result:", result);
  }

  // --- LIST ---
  if (hasFlag("--list")) {
    const lessons = await listLessons();
    console.log("LIST lessons:", lessons);
  }

  // --- LOAD ---
  if (hasFlag("--load")) {
    const idIndex = args.indexOf("--load") + 1;
    const id = args[idIndex];
    if (!id) {
      console.error("You must provide a lesson ID after --load");
      return;
    }
    const lesson = await loadLesson(id);
    console.log("LOAD lesson:", lesson.meta.title, lesson.meta.id);
  }

  // --- UPDATE ---
  if (hasFlag("--update")) {
    const idIndex = args.indexOf("--update") + 1;
    const id = args[idIndex];
    if (!id) {
      console.error("You must provide a lesson ID after --update");
      return;
    }
    const lesson = await loadLesson(id);
    
    lesson.meta.title += " [Updated]";
    const result = await saveLessonToServer(lesson);
    console.log("UPDATE result:", result);
  }

  // --- DELETE ---
  if (hasFlag("--delete")) {
    const idIndex = args.indexOf("--delete") + 1;
    const id = args[idIndex];
    if (!id) {
      console.error("You must provide a lesson ID after --delete");
      return;
    }
    const result = await deleteLesson(id);
    console.log("DELETE result:", result);
  }
}

main().catch(console.error);

/**
 * Usage:
 * 
 * # Create a new lesson
 * npx ts-node --project tsconfig.scripts.json scripts/testlessoncrud.ts --create
 * 
 * # List all lessons
 * npx ts-node --project tsconfig.scripts.json scripts/testlessoncrud.ts --list
 * 
 * # Load a lesson by ID
 * npx ts-node --project tsconfig.scripts.json scripts/testlessoncrud.ts --load {lesson_id}
 * 
 * # Update a lesson by ID
 * npx ts-node --project tsconfig.scripts.json scripts/testlessoncrud.ts --update {lesson_id}
 * 
 * # Delete a lesson by ID
 * npx ts-node --project tsconfig.scripts.json scripts/testlessoncrud.ts --delete {lesson_id}
 */

