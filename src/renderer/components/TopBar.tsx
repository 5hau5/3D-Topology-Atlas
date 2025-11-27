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
}: Props) {

  const [showAddMenu, setShowAddMenu] = useState(false);

  function prevStep() {
    setCurrentStep(Math.max(0, currentStep - 1));
  }

  function nextStep() {
    setCurrentStep(Math.min(lesson.steps.length - 1, currentStep + 1));
  }

  // ---------------------------
  // CREATE NEW LESSON
  // ---------------------------
  function createNewLesson() {
    const title = prompt('Enter lesson title:');
    if (!title) return;

    const newLesson: Lesson = {
      meta: {
        title,
        version: "1.0",
        created_at: new Date().toISOString()
      },
      steps: [
        {
          title: "Page 1",
          description: "",
          asset: null
        }
      ]
    };


    // Add to list
    const updatedList = [...lessonsList, newLesson];
    setLessonsList(updatedList);

    // Set as active
    setLesson(newLesson);
    setEditing(true);
    setCurrentStep(0);
  }

  // ---------------------------
  // IMPORT LESSON
  // ---------------------------
  function importLesson() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported: Lesson = JSON.parse(reader.result as string);

          const updatedList = [...lessonsList, imported];
          setLessonsList(updatedList);

          setLesson(imported);
          setEditing(false);
          setCurrentStep(0);

        } catch {
          alert('Failed to import lesson');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }

  // ---------------------------
  // SAVE LESSON
  // ---------------------------
  function saveLesson() {
    setEditing(false);
    alert(`Lesson "${lesson.meta.title}" saved!`);
  }

  // ---------------------------
  // ADD PAGE
  // ---------------------------
  function addPage() {
    if (!editing) {
      alert("Enable editing mode first");
      return;
    }

    const title = prompt(
      'Enter page title:',
      `Page ${lesson.steps.length + 1}`
    );
    if (!title) return;

    const newStep: LessonStep = {
      title: `Page ${lesson.steps.length + 1}`,
      description: '',
      asset: null
    };

    const updatedLesson: Lesson = {
      ...lesson,
      steps: [...lesson.steps, newStep]
    };

    setLesson(updatedLesson);
    setCurrentStep(updatedLesson.steps.length - 1);
  }

  const step = lesson.steps[currentStep]; // <- add this

  function addAsset() {
    if (!editing) return;

    const step = lesson.steps[currentStep];
    if (step.asset) {
      alert("Only one asset per page is allowed.");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".glb,.gltf";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = () => {
        const base64 = reader.result as string;

        const newAsset = {
          name: file.name,          // file name
          file_data: base64,        // base64 data URL
          type: "glb"
        };

        const newSteps = [...lesson.steps];
        newSteps[currentStep].asset = newAsset;

        setLesson({
          ...lesson,
          steps: newSteps
        });
      };

      reader.readAsDataURL(file); // converts to base64
    };

    input.click();
  }


  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: 8,
      background: '#222',
      color: '#fff',
      gap: 12
    }}>
      
      {/* LESSON SELECTOR */}
      <select
        value={lesson.meta.title}
        onChange={(e) => {
          const selected = lessonsList.find(
            l => l.meta.title === e.target.value
          );
          if (selected) {
            setLesson(selected);
            setCurrentStep(0);
            setEditing(false);
          }
        }}
      >
        {lessonsList.map((l) => (
          <option key={l.meta.title} value={l.meta.title}>{l.meta.title}</option>
        ))}
      </select>

      {/* STEP NAV */}
      <button onClick={prevStep}>Prev</button>
      <span>{currentStep + 1} / {lesson.steps.length}</span>
      <button onClick={nextStep}>Next</button>

      {/* EDIT / SAVE */}
      <button onClick={editing ? saveLesson : () => setEditing(true)}>
        {editing ? 'Save Lesson' : 'Edit Lesson'}
      </button>

      {/* ADD PAGE (only while editing) */}
      {editing && (
        <>
          <button onClick={addPage}>+ Add Page</button>
          <button onClick={addAsset}>+ Asset</button>
        </>
      )}
      <div style={{ marginTop: 8 }}>
            <button onClick={addAsset}>+ Asset</button>
      </div>

      {/* ADD LESSON DROPDOWN */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => setShowAddMenu(!showAddMenu)}>
          Add Lesson ▼
        </button>

        {showAddMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: '#333',
            padding: 4,
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            zIndex: 10
          }}>
            <button onClick={() => { createNewLesson(); setShowAddMenu(false); }}>
              Create New Lesson
            </button>

            <button onClick={() => { importLesson(); setShowAddMenu(false); }}>
              Import Lesson
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
