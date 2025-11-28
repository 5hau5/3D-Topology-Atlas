import React, { useState } from 'react';
import { Lesson, LessonStep, LessonAsset } from '../../LessonStuff';

type Props = {
  lessonsList: Lesson[];
  setLessonsList: (l: Lesson[]) => void;
  lesson: Lesson;
  setLesson: (l: Lesson) => void;
  currentStep: number;
  setCurrentStep: (n: number) => void;
  editing: boolean;
  setEditing: (b: boolean) => void;

  saveLesson: (lesson: Lesson) => Promise<any>;
  deleteLesson: (id: string) => Promise<any>;
};

export default function TopBar({
  lessonsList,
  setLessonsList,
  lesson,
  setLesson,
  currentStep,
  setCurrentStep,
  editing,
  setEditing,
  saveLesson,
  deleteLesson,
}: Props) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  function prevStep() {
    setCurrentStep(Math.max(0, currentStep - 1));
  }

  function nextStep() {
    setCurrentStep(Math.min(lesson.steps.length - 1, currentStep + 1));
  }

  // --- CREATE NEW LESSON ---
  async function createNewLesson() {
    const title = prompt('Enter lesson title:');
    if (!title) return;

    const newLesson: Lesson = {
      meta: {
        id: '',
        title,
        author: 'User',
        version: '1.0',
        created_at: new Date().toISOString(),
      },
      steps: [{ description: '', asset: null }],
    };

    const result = await saveLesson(newLesson);
    if (result.ok) {
      newLesson.meta.id = result.id || newLesson.meta.id;
      setLessonsList([...lessonsList, newLesson]);
      setLesson(newLesson);
      setEditing(true);
      setCurrentStep(0);
    } else {
      alert('Failed to create lesson');
    }
  }

  // --- SAVE LESSON ---
  async function handleSaveLesson() {
    setEditing(false);
    const result = await saveLesson(lesson);
    if (result.ok) alert(`Lesson "${lesson.meta.title}" saved!`);
    else alert('Failed to save lesson');
  }

  // --- DELETE LESSON ---
  async function handleDeleteLesson() {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    const result = await deleteLesson(lesson.meta.id);
    if (result.ok) {
      setLessonsList(lessonsList.filter(l => l.meta.id !== lesson.meta.id));
      setLesson(lessonsList[0] || null);
      setCurrentStep(0);
    } else {
      alert('Failed to delete lesson');
    }
  }

  // --- ADD PAGE ---
  function addPage() {
    if (!editing) return alert("Enable editing mode first");
    const newStep: LessonStep = { description: '', asset: null };
    const updatedLesson: Lesson = { ...lesson, steps: [...lesson.steps, newStep] };
    setLesson(updatedLesson);
    setCurrentStep(updatedLesson.steps.length - 1);
  }

  // --- ADD ASSET ---
  function addAsset() {
    if (!editing) return;

    const step = lesson.steps[currentStep];
    if (step.asset) return alert("Only one asset per page");

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.glb,.gltf';

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const newAsset: LessonAsset = { name: file.name, file_data: base64, type: 'glb' };
        const newSteps = [...lesson.steps];
        newSteps[currentStep].asset = newAsset;
        setLesson({ ...lesson, steps: newSteps });
      };
      reader.readAsDataURL(file);
    };

    input.click();
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: 8, background: '#222', color: '#fff', gap: 12 }}>
      {/* Lesson selector */}
      <select
        value={lesson.meta.id}
        onChange={e => {
          const selected = lessonsList.find(l => l.meta.id === e.target.value);
          if (selected) {
            setLesson(selected);
            setCurrentStep(0);
            setEditing(false);
          }
        }}
      >
        {lessonsList.map(l => (
          <option key={l.meta.id} value={l.meta.id}>{l.meta.title}</option>
        ))}
      </select>

      {/* Step navigation */}
      <button onClick={prevStep}>Prev</button>
      <span>{currentStep + 1} / {lesson.steps.length}</span>
      <button onClick={nextStep}>Next</button>

      {/* Edit / Save */}
      <button onClick={editing ? handleSaveLesson : () => setEditing(true)}>
        {editing ? 'Save Lesson' : 'Edit Lesson'}
      </button>

      {/* Add page / asset */}
      {editing && (
        <>
          <button onClick={addPage}>+ Add Page</button>
          <button onClick={addAsset}>+ Asset</button>
          <button onClick={handleDeleteLesson} style={{ color: 'red' }}>Delete Lesson</button>
        </>
      )}

      {/* Add lesson menu */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => setShowAddMenu(!showAddMenu)}>Add Lesson ▼</button>
        {showAddMenu && (
          <div style={{ position: 'absolute', top: '100%', left: 0, background: '#333', padding: 4, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 10 }}>
            <button onClick={() => { createNewLesson(); setShowAddMenu(false); }}>Create New Lesson</button>
          </div>
        )}
      </div>
    </div>
  );
}
