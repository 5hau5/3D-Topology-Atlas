// createDefaultLesson.js
const fs = require("fs");
const path = require("path");

// --- CONFIG ---
const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "public", "lessons", "default");
const outputFile = path.join(outputDir, "lesson.json");

// GLB files (replace with your actual files)
const assets = [
  { file: "cube.glb", pageTitle: "Page 1", description: "This is a cube" },
  { file: "sphere.glb", pageTitle: "Page 2", description: "This is a sphere" }
];

// --- HELPER FUNCTION ---
function glbToBase64(filePath) {
  const data = fs.readFileSync(filePath);
  return `data:model/gltf-binary;base64,${data.toString("base64")}`;
}

// --- BUILD LESSON ---
const lesson = {
  meta: {
    title: "Default",
    version: "1.0",
    created_at: new Date().toISOString()
  },
  steps: assets.map((a, i) => ({
    title: a.pageTitle,
    description: a.description,
    asset: {
        name: `asset_${i + 1}_${path.parse(a.file).name}`,
        file_data: glbToBase64(path.join(__dirname, a.file)),
        type: "glb"
      }
  }))
};

// --- ENSURE OUTPUT DIRECTORY EXISTS ---
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// --- WRITE JSON ---
fs.writeFileSync(outputFile, JSON.stringify(lesson, null, 2));
console.log(`Default lesson saved to ${outputFile}`);
