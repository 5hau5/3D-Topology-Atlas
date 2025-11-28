import React, { useState, useEffect } from "react";
import TopBar from "./components/TopBar";
import Viewer from "./components/Viewer";
import Inspector from "./components/Inspector";
import { Lesson, loadAllLessons, saveLesson, deleteLesson } from "../LessonStuff";

export default function App() {
  const [lessonsList, setLessonsList] = useState<Lesson[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [editing, setEditing] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [xray, setXray] = useState(false);

  useEffect(() => {
    const load = async () => {
      const loadedLessons = await loadAllLessons();
      setLessonsList(loadedLessons);

      const defaultLesson =
        loadedLessons.find(l => l.meta.id === "default") ||
        loadedLessons[0] ||
        null;
      setLesson(defaultLesson);
      setCurrentStep(0);
    };
    load();
  }, []);

  if (!lesson) return <div>Loading lessons...</div>;

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar
        lessonsList={lessonsList}
        setLessonsList={setLessonsList}
        lesson={lesson}
        setLesson={setLesson}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        editing={editing}
        setEditing={setEditing}
        saveLesson={async l => await saveLesson(l, lessonsList, setLessonsList)}
        deleteLesson={async id => await deleteLesson(id, lessonsList, setLessonsList)}
      />

      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Viewer
            currentPage={lesson.steps[currentStep]}
            wireframe={wireframe}
            xray={xray}
            setWireframe={setWireframe}
            setXray={setXray}
          />
        </div>

        <div
          style={{
            width: 320,
            borderLeft: "1px solid #333",
            overflowY: "auto",
            padding: 8,
            boxSizing: "border-box",
          }}
        >
          <Inspector
            lesson={lesson}
            setLesson={setLesson}
            currentStep={currentStep}
            editing={editing}
          />
        </div>
      </div>
    </div>
  );
}
