import React, { useEffect, useState } from 'react';
import Viewer from './components/Viewer';
import Inspector from './components/Inspector';
import JSZip from 'jszip';

export type Annotation = { id: string; position: [number,number,number]; text?: string; objectId?: string };
export type Lesson = {
  meta: { title: string; author?: string; version?: string; created_at?: string };
  scene: { assets: { id:string; path:string; type:string }[]; objects: any[]; annotations: Annotation[]; steps?: any[]; animations?: any[] }
}

const defaultLesson: Lesson = {
  meta: { title: 'Untitled Lesson', version: '1.0', created_at: new Date().toISOString() },
  scene: { assets: [], objects: [], annotations: [] }
};

export default function App() {
  const [lesson, setLesson] = useState<Lesson>(defaultLesson);
  const [lessonsList, setLessonsList] = useState<Lesson[]>([]);

  // load default lessons from public/assets/samples
  useEffect(() => {
    const loadLessons = async () => {
      const paths = ['/assets/samples/lesson1/lesson.json', '/assets/samples/lesson2/lesson.json'];
      const loaded: Lesson[] = [];
      for (const path of paths) {
        try {
          const res = await fetch(path);
          const l = await res.json();
          loaded.push(l);
        } catch(e) {
          console.warn('Failed to load lesson', path, e);
        }
      }
      setLessonsList(loaded);
      if (loaded.length) setLesson(loaded[0]);
    };
    loadLessons();
  }, []);

  async function exportLesson() {
    const zip = new JSZip();
    zip.file('lesson.json', JSON.stringify(lesson, null, 2));
    // embed assets
    for (const asset of lesson.scene.assets) {
      try {
        const res = await fetch(asset.path); // paths should be public URL
        const buf = await res.arrayBuffer();
        zip.file(asset.path.split('/').pop() || asset.path, buf);
      } catch (e) {
        console.warn('could not embed asset', asset, e);
      }
    }
    const content = await zip.generateAsync({ type: 'uint8array' });
    const blob = new Blob([new Uint8Array(content)]); 
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lesson.meta.title}.topo`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app">

      <div className="lesson-selector">
        <label>Choose Lesson: </label>
        <select value={lesson.meta.title} onChange={e => {
          const l = lessonsList.find(l => l.meta.title === e.target.value);
          if (l) setLesson(l);
        }}>
          {lessonsList.map(l => (
            <option key={l.meta.title} value={l.meta.title}>{l.meta.title}</option>
          ))}
        </select>
        <button className="btn" onClick={exportLesson}>Export</button>
      </div>

      <div className="viewer">
        <Viewer lesson={lesson} setLesson={setLesson} />
      </div>

      <div className="panel">
        <Inspector lesson={lesson} setLesson={setLesson} />
        <div style={{marginTop:12}}>
          <button className="btn" onClick={exportLesson}>Export Lesson (.topo)</button>
        </div>
      </div>

      <div className="bottom panel">
        <div className="small">Lesson preview / description / timeline (future)</div>
      </div>

    </div>
  )
}
