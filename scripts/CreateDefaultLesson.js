// createDefaultLesson.js
const fs = require("fs");
const path = require("path");
const { nanoid } = require("nanoid");

// CONFIG
const projectRoot = path.resolve(__dirname, "..");
const lessonsDir = path.join(projectRoot, "public", "lessons");
const lessonFilename = "default_lesson.json";
const lessonFile = path.join(lessonsDir, lessonFilename);
const indexFile = path.join(lessonsDir, "index.json");

// GLB assets
const assets = [
  { file: "cube.glb", description: "This is a cube" },
  { file: "sphere.glb", description: "This is a sphere" }
];

// Helpers
function glbToBase64(filePath) {
  const data = fs.readFileSync(filePath);
  return `data:model/gltf-binary;base64,${data.toString("base64")}`;
}

// Lesson ID
const lessonId = "default";

// Build Lesson JSON (matches your schema)
const lesson = {
  meta: {
    id: lessonId,
    title: "Default Lesson",
    author: "System",
    version: "1.0",
    created_at: new Date().toISOString()
  },
  steps: assets.map((entry, i) => ({
    description: entry.description || "",
    asset: {
      name: `asset_${i + 1}_${path.parse(entry.file).name}`,
      file_data: glbToBase64(path.join(__dirname, entry.file)),
      type: "glb"
    }
  }))
};

// Ensure lessons directory exists
if (!fs.existsSync(lessonsDir)) {
  fs.mkdirSync(lessonsDir, { recursive: true });
}

// --- Write the lesson file ---
fs.writeFileSync(lessonFile, JSON.stringify(lesson, null, 2));

// --- Handle the index file ---
let index = {};

// If index file exists, load it
if (fs.existsSync(indexFile)) {
  try {
    index = JSON.parse(fs.readFileSync(indexFile, "utf8"));
  } catch (err) {
    console.error("Index file corrupted. Rebuilding a new one.");
    index = {};
  }
}

// Insert or overwrite the default lesson entry
index[lessonId] = {
  id: lessonId,
  title: lesson.meta.title,
  filename: lessonFilename,
  created_at: lesson.meta.created_at
};

// Write updated index
fs.writeFileSync(indexFile, JSON.stringify(index, null, 2));

console.log("✔ Default lesson created and indexed.");
console.log(" - Lesson:", lessonFile);
console.log(" - Index :", indexFile);


// node scripts/CreateDefaultLesson.js