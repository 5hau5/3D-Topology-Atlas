import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Lesson, LessonStep } from '../LessonStuff';

type Props = { lesson: Lesson; setLesson: (l:Lesson)=>void; currentStep: number; editing: boolean };

export default function Inspector({ lesson, setLesson, currentStep, editing }: Props) {
  const step = lesson.steps[currentStep];

  function updateDescription(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newSteps = [...lesson.steps];
    newSteps[currentStep].description = e.target.value;
    setLesson({ ...lesson, steps: newSteps });
  }

  return (
    <div>
      <h2>{lesson.meta.title}</h2>
      {editing ? (
        <textarea
          value={step.description || ''}
          onChange={updateDescription}
          style={{ width:'100%', height:'80%', resize:'vertical' }}
        />
      ) : (
        <ReactMarkdown>{step.description || 'No description'}</ReactMarkdown>
      )}
    </div>
  );
}
