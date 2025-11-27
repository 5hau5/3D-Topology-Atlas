import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Viewer from './components/Viewer';
import Inspector from './components/Inspector';
import { Lesson, loadLesson } from '../LessonStuff';

export default function App() {
  const [lessonsList, setLessonsList] = useState<Lesson[]>([]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [editing, setEditing] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [xray, setXray] = useState(false);

  useEffect(() => {
    const folderToLoad = 'default';
    loadLesson(folderToLoad)
      .then((lesson) => {
        setLessonsList([lesson]);
        setLesson(lesson);
      })
      .catch(console.error);
  }, []);

  if (!lesson) return <div>Loading lesson...</div>;

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <TopBar
        lessonsList={lessonsList}
        setLessonsList={setLessonsList}
        lesson={lesson}
        setLesson={setLesson}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        editing={editing}
        setEditing={setEditing}
      />

      {/* Main content: viewer + inspector */}
      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ flex: 1, position: 'relative' }}>
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
            borderLeft: '1px solid #333',
            overflowY: 'auto',
            padding: '8px',
            boxSizing: 'border-box',
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
