// AppTypes.ts

export type Annotation = {
  id: string;
  position: [number, number, number];
  text?: string;
  objectId?: string;
};

export type LessonStep = {
  title: string;                          // Step/Page title
  description?: string;                   // Step explanation
  assets?: { id: string; path: string; type: string }[];
  objects?: any[];                        // Links to assets, transform data
  annotations?: Annotation[];
  animations?: any[];                      // Optional animations
};

export type Lesson = {
  meta: {
    title: string;
    author?: string;
    version?: string;
    created_at?: string;
  };
  steps: LessonStep[];                     // Array of pages/steps
};
