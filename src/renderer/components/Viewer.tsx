import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
//import { SubdivisionModifier } from '@three-modifiers/SubdivisionModifier.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


import { Lesson, Annotation } from '../App';

type Props = { lesson: Lesson; setLesson: (l: Lesson)=>void };

export default function Viewer({ lesson, setLesson }: Props) {
  const mountRef = useRef<HTMLDivElement|null>(null);
  const [wireframe, setWireframe] = useState(false);
  const [xray, setXray] = useState(false);
  const [subdivisionLevel, setSubdivisionLevel] = useState(0);

  // scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelRootRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth/mount.clientHeight, 0.1, 1000);
    camera.position.set(0,1.4,2.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.6);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(3,10,5);
    scene.add(dir);

    // ground
    const grid = new THREE.GridHelper(10,10,0x333333,0x222222);
    scene.add(grid);

    // root
    const root = new THREE.Group();
    root.name = 'lessonRoot';
    scene.add(root);
    modelRootRef.current = root;

    // handle window resize
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w/h;
      camera.updateProjectionMatrix();
      renderer.setSize(w,h);
    };
    window.addEventListener('resize', onResize);

    // animation loop
    let req = 0;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      req = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(req);
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // load / reload models when lesson.scene.objects changes
  useEffect(() => {
    (async () => {
      const root = modelRootRef.current!;
      if (!root) return;

      // Clear previous scene
      while (root.children.length) {
        root.remove(root.children[0]);
      }

      // If no assets, load a default cube
      if (!lesson.scene?.assets || lesson.scene.assets.length === 0) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);

        cube.castShadow = true;
        cube.receiveShadow = true;

        root.add(cube);

        applyWireframe(wireframe);
        applyXray(xray);

        return;
      }

      // Load GLB/GLTF assets
      for (const obj of lesson.scene.assets) {
        try {
          if (
            obj.type === "glb" ||
            obj.path.toLowerCase().endsWith(".glb") ||
            obj.path.toLowerCase().endsWith(".gltf")
          ) {
            const loader = new GLTFLoader();
            const gltf = await loader.loadAsync(obj.path);
            const model = gltf.scene;

            model.traverse((c: any) => {
              if (c.isMesh) {
                c.castShadow = true;
                c.receiveShadow = true;
                c.material.transparent = false;
              }
            });

            root.add(model);
          }
        } catch (err) {
          console.warn("Error loading asset:", obj, err);
        }
      }

      applyWireframe(wireframe);
      applyXray(xray);
    })();
  }, [lesson, wireframe, xray]);


  // wireframe toggle implementations
  function applyWireframe(enabled: boolean) {
    const root = modelRootRef.current;
    if (!root) return;
    root.traverse((c: any) => {
      if (c.isMesh) {
        (c.material as any).wireframe = !!enabled;
      }
    });
  }

  function applyXray(enabled: boolean) {
    const root = modelRootRef.current;
    if (!root) return;
    root.traverse((c: any) => {
      if (c.isMesh) {
        c.material.transparent = !!enabled;
        c.material.opacity = enabled ? 0.35 : 1.0;
        c.material.depthWrite = !enabled;
      }
    });
  }

  // function applySubdivision(level: number) {
  //   const root = modelRootRef.current;
  //   if (!root) return;
  //   // naive approach: duplicate and modify geometry (use a modifier)
  //   const subs = new SubdivisionModifier(Math.max(0, level));
  //   root.traverse((c:any) => {
  //     if (c.isMesh) {
  //       try {
  //         const geom = c.geometry.clone();
  //         subs.modify(geom);
  //         c.geometry.dispose();
  //         c.geometry = geom;
  //       } catch (e) {
  //         console.warn('subdivision failed', e);
  //       }
  //     }
  //   });
  // }

  // wireframe/xray UI state handlers
  useEffect(() => applyWireframe(wireframe), [wireframe]);
  useEffect(() => applyXray(xray), [xray]);
  // useEffect(() => applySubdivision(subdivisionLevel), [subdivisionLevel]);

  // raycast click to add annotation
  useEffect(() => {
    const mount = mountRef.current!;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const camera = cameraRef.current!;
    const scene = sceneRef.current!;
    const renderer = rendererRef.current!;

    const onClick = (ev: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (!intersects.length) return;
      const hit = intersects[0];
      const pos = hit.point;
      // create annotation in lesson state
      const ann: Annotation = { id: Date.now().toString(), position: [pos.x, pos.y, pos.z], text: 'New note', objectId: hit.object.name || '' };
      const newLesson = { ...lesson, scene: { ...lesson.scene, annotations: [...(lesson.scene.annotations || []), ann] } };
      setLesson(newLesson);
      // create marker visual
      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffcc00 }));
      marker.position.copy(pos);
      marker.userData.annotationId = ann.id;
      const root = modelRootRef.current!;
      root.add(marker);
    };

    renderer.domElement.addEventListener('dblclick', onClick);
    return () => renderer.domElement.removeEventListener('dblclick', onClick);
  }, [lesson]);

  return (
    <div style={{width:'100%', height:'100%', position:'relative'}}>
      <div ref={mountRef} style={{width:'100%', height:'100%'}}/>
      <div style={{position:'absolute', left:8, top:8, display:'flex', flexDirection:'column', gap:6}}>
        <label style={{background:'rgba(0,0,0,0.4)', padding:'6px', borderRadius:6}}>
          <input type="checkbox" checked={wireframe} onChange={e => setWireframe(e.target.checked)} /> Wireframe
        </label>
        <label style={{background:'rgba(0,0,0,0.4)', padding:'6px', borderRadius:6}}>
          <input type="checkbox" checked={xray} onChange={e => setXray(e.target.checked)} /> X-ray
        </label>
        <div style={{background:'rgba(0,0,0,0.4)', padding:'6px', borderRadius:6}}>
          Subdivision:
          <select value={subdivisionLevel} onChange={e => setSubdivisionLevel(parseInt(e.target.value))}>
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </div>
      </div>
    </div>
  );
}
