import express from "express";
import bodyParser from "body-parser";
import cors from "cors"; // <--- add this
import lessonsRouter from "./routes/lessons";

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({ origin: "http://localhost:5173" })); // allow Vite dev server

// parse JSON body
app.use(bodyParser.json({ limit: "50mb" }));

// serve public folder for assets and lessons
app.use(express.static("public"));

// API routes
app.use("/api/lessons", lessonsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
