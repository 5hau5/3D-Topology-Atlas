import React from 'react';
import { Lesson } from '../App';

export default function Inspector({ lesson, setLesson }: { lesson: Lesson; setLesson: (l: Lesson)=>void }) {
  async function importModel() {
    const path = await (window as any).atlasAPI.openFile([{ name: 'glb', extensions: ['glb','gltf'] }]);
    if (!path) return;
    const id = 'asset_' + Date.now();
    const newLesson = {
      ...lesson,
      scene: {
        ...lesson.scene,
        assets: [...(lesson.scene.assets||[]), { id, path, type: 'glb' }],
        objects: [...(lesson.scene.objects||[]), { id: 'obj_'+id, assetId: id }]
      }
    };
    setLesson(newLesson);
  }

  return (
    <div>
      <h3>{lesson.meta.title}</h3>
      <button className="btn" onClick={importModel}>Import Model</button>
      <h4>Assets</h4>
      <ul>
        {(lesson.scene.assets || []).map(a => <li key={a.id}>{a.path}</li>)}
      </ul>
      <h4>Annotations</h4>
      <ul>
        {(lesson.scene.annotations || []).map(a => <li key={a.id}>{a.text} @ {a.position.map(v=>v.toFixed(2)).join(',')}</li>)}
      </ul>
    </div>
  );
}
