import React from 'react';
import { Lesson } from '../LessonStuff';

type Props = {
  lessonsList: Lesson[];
  lesson: Lesson;
  setLesson: (l: Lesson)=>void;
  currentStep: number;
  setCurrentStep: (n:number)=>void;
  editing: boolean;
  setEditing: (b:boolean)=>void;
};

export default function TopBar({
  lessonsList, lesson, setLesson,
  currentStep, setCurrentStep,
  editing, setEditing
}: Props) {

  function prevStep() { setCurrentStep(Math.max(0, currentStep-1)); }
  function nextStep() { setCurrentStep(Math.min(lesson.steps.length-1, currentStep+1)); }

  return (
    <div style={{ display:'flex', alignItems:'center', padding:8, background:'#222', color:'#fff', gap:12 }}>
      <span>Lesson: </span>
      <select
        value={lesson.meta.title}
        onChange={e => {
          const l = lessonsList.find(l => l.meta.title === e.target.value);
          if(l) setLesson(l);
        }}
      >
        {lessonsList.map(l => <option key={l.meta.title}>{l.meta.title}</option>)}
      </select>

      <button onClick={prevStep}>Prev Step</button>
      <span>{currentStep+1} / {lesson.steps.length}</span>
      <button onClick={nextStep}>Next Step</button>

      <button onClick={() => setEditing(!editing)}>
        {editing ? 'Stop Editing' : 'Edit Lesson'}
      </button>

      <div>
        <button>Add Lesson ▼</button>
        <div style={{ display:'none' }}>
          <button>Import Lesson</button>
          <button>Create New Lesson</button>
        </div>
      </div>
    </div>
  );
}
