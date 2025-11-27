import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LessonStep } from '../LessonStuff';

type Props = { currentPage: LessonStep };

export default function Viewer({ currentPage }: Props) {
  const mountRef = useRef<HTMLDivElement|null>(null);
  const sceneRef = useRef<THREE.Scene|null>(null);
  const rootRef = useRef<THREE.Group|null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera|null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer|null>(null);
  const controlsRef = useRef<OrbitControls|null>(null);

  const [wireframe, setWireframe] = useState(false);
  const [xray, setXray] = useState(false);

  useEffect(() => {
    const mount = mountRef.current!;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth/mount.clientHeight, 0.1, 1000);
    camera.position.set(0,1.4,2.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias:true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    scene.add(new THREE.HemisphereLight(0xffffff,0x222222,0.6));
    const dir = new THREE.DirectionalLight(0xffffff,0.8); dir.position.set(3,10,5); scene.add(dir);
    scene.add(new THREE.GridHelper(10,10,0x333333,0x222222));

    const root = new THREE.Group(); scene.add(root); rootRef.current = root;

    const animate = () => { controls.update(); renderer.render(scene,camera); requestAnimationFrame(animate); };
    animate();

    return () => { mount.removeChild(renderer.domElement); renderer.dispose(); };
  }, []);

  useEffect(() => {
    const root = rootRef.current!;
    while(root.children.length) root.remove(root.children[0]);

    if(!currentPage.assets || currentPage.assets.length === 0) {
      const geo = new THREE.BoxGeometry(1,1,1);
      const mat = new THREE.MeshStandardMaterial({ color:0x00ff00 });
      root.add(new THREE.Mesh(geo,mat));
      return;
    }

    currentPage.assets.forEach(async asset => {
      if(asset.type==='glb' || asset.path.toLowerCase().endsWith('.glb')) {
        const loader = new GLTFLoader();
        try { const gltf = await loader.loadAsync(asset.path); root.add(gltf.scene); }
        catch(e){ console.warn('GLB load failed', asset,e);}
      }
    });
  }, [currentPage]);

  const resetCamera = () => {
    const cam = cameraRef.current!;
    cam.position.set(0,1.4,2.8);
    controlsRef.current?.target.set(0,0,0);
    controlsRef.current?.update();
  }

  return (
    <div style={{width:'100%', height:'100%', position:'relative'}}>
      <div ref={mountRef} style={{width:'100%', height:'100%'}} />
      <div style={{position:'absolute', top:8, left:8, display:'flex', flexDirection:'column', gap:6}}>
        <label style={{background:'rgba(0,0,0,0.4)', padding:6, borderRadius:6}}>
          <input type="checkbox" checked={wireframe} onChange={e=>setWireframe(e.target.checked)} /> Wireframe
        </label>
        <label style={{background:'rgba(0,0,0,0.4)', padding:6, borderRadius:6}}>
          <input type="checkbox" checked={xray} onChange={e=>setXray(e.target.checked)} /> X-ray
        </label>
        <button onClick={resetCamera}>Reset Camera</button>
      </div>
    </div>
  );
}
