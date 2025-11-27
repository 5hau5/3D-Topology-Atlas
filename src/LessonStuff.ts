import fs from 'fs';
import path from 'path';

export type Annotation = {
  id: string;
  position: [number, number, number];
  text?: string;
  objectId?: string;
};

export type LessonAsset = {
  name: string;
  file_data: string;
  type: string;
};

export type LessonStep = {
  title: string;
  description: string;
  asset: LessonAsset | null;
};

export type Lesson = {
  meta: {
    title: string;
    version: string;
    created_at: string;
  };
  steps: LessonStep[];
};



export async function loadLesson(folderName: string): Promise<Lesson> {
  try {
    if (!folderName) throw new Error('No lesson folder name provided');

    // Load the first JSON file in the folder
    const res = await fetch(`/lessons/${folderName}/lesson.json`);
    if (!res.ok) throw new Error(`Failed to fetch lesson: ${res.status}`);
    
    const lesson: Lesson = await res.json();
    console.log(`Lesson "${folderName}" loaded:`, lesson);
    return lesson;
  } catch (err) {
    console.error('Failed to load lesson', err);
    throw err;
  }
}