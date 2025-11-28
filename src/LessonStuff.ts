export type LessonAsset = {
  name: string;
  file_data: string;
  type: string;
};

export type LessonStep = {
  description: string;
  asset: LessonAsset | null;
};

export type Lesson = {
  meta: {
    id: string;
    title: string;
    author: string;
    version: string;
    created_at: string;
  };
  steps: LessonStep[];
};

// Use relative URL so Vite proxy or Electron dev works
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// ------------------------
// Load all lessons
// ------------------------
export async function loadAllLessons(): Promise<Lesson[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/lessons/list`);
    if (!res.ok) throw new Error("Failed to fetch lessons list");

    const index: { id: string; title: string; filename: string }[] = await res.json();

    const lessons: Lesson[] = [];
    for (const entry of index) {
      try {
        const lessonRes = await fetch(`${BACKEND_URL}/api/lessons/${entry.id}`);
        const lesson: Lesson = await lessonRes.json();
        lessons.push(lesson);
      } catch (err) {
        console.warn(`Failed to load lesson ${entry.id}:`, err);
      }
    }

    return lessons;
  } catch (err) {
    console.error("Failed to load all lessons", err);
    return [];
  }
}

// ------------------------
// Save lesson
// ------------------------
export async function saveLesson(
  lesson: Lesson,
  lessonsList?: Lesson[],
  setLessonsList?: (ls: Lesson[]) => void
) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/lessons/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lesson),
    });

    const data = await res.json();

    // backend returns { success: true, id }
    if (data.success) {
      if (lessonsList && setLessonsList) {
        const updatedList = lessonsList.filter(l => l.meta.id !== lesson.meta.id);
        updatedList.push({ ...lesson, meta: { ...lesson.meta, id: data.id } });
        setLessonsList(updatedList);
      }
      lesson.meta.id = data.id; // ensure ID is set
    }

    return { ok: !!data.success, id: data.id };
  } catch (err) {
    console.error("Failed to save lesson", err);
    return { ok: false, error: err };
  }
}

// ------------------------
// Delete lesson
// ------------------------
export async function deleteLesson(
  id: string,
  lessonsList?: Lesson[],
  setLessonsList?: (ls: Lesson[]) => void
) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/lessons/delete/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (data.success && lessonsList && setLessonsList) {
      const updatedList = lessonsList.filter(l => l.meta.id !== id);
      setLessonsList(updatedList);
    }

    return { ok: !!data.success };
  } catch (err) {
    console.error("Failed to delete lesson", err);
    return { ok: false, error: err };
  }
}
