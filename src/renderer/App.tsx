import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Viewer from './components/Viewer';
import Inspector from './components/Inspector';
import { Lesson, LessonStep } from './LessonStuff';

const defaultLesson: Lesson = {
  meta: { title: 'Untitled Lesson', version: '1.0', created_at: new Date().toISOString() },
  steps: [{ title: 'Page 1', description: 'Initial step', assets: [], objects: [], annotations: [] }]
};

export default function App() {
  const [lesson, setLesson] = useState<Lesson>(defaultLesson);
  const [lessonsList, setLessonsList] = useState<Lesson[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [editing, setEditing] = useState(false);

  const currentPage = lesson.steps[currentStep];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar
        lessonsList={lessonsList}
        lesson={lesson}
        setLesson={setLesson}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        editing={editing}
        setEditing={setEditing}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 3, position: 'relative' }}>
          <Viewer currentPage={currentPage} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12, borderLeft: '1px solid #333' }}>
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
