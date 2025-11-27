import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LessonStep } from '../../LessonStuff';

type Props = {
  currentPage: LessonStep;
  wireframe: boolean;
  xray: boolean;
  setWireframe: React.Dispatch<React.SetStateAction<boolean>>;
  setXray: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Viewer({ currentPage, wireframe, xray, setWireframe, setXray }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // --- Initialize scene ---
  useEffect(() => {
    const mount = mountRef.current!;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.4, 2.8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 0.6));
    // const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    // dir.position.set(3, 10, 5);
    // scene.add(dir);
    scene.add(new THREE.GridHelper(10, 10, 0x333333, 0x222222));

    const root = new THREE.Group();
    scene.add(root);
    rootRef.current = root;

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // --- Load page asset & apply wireframe/xray ---
  useEffect(() => {
    const root = rootRef.current!;
    while (root.children.length) root.remove(root.children[0]);

    const asset = currentPage.asset;
    if (!asset) {
      const geo = new THREE.BoxGeometry(1, 1, 1);
      const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe });
      root.add(new THREE.Mesh(geo, mat));
      return;
    }

    const loader = new GLTFLoader();
    const loadAsset = async () => {
      try {
        const base64 = asset.file_data.split(',')[1];
        const binary = atob(base64);
        const arrayBuffer = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) arrayBuffer[i] = binary.charCodeAt(i);

        const gltf = await loader.parseAsync(arrayBuffer.buffer, '');
        gltf.scene.traverse((child: any) => {
          if (child.isMesh) {
            const geom = child.geometry;

            // remove vertex colors if present
            if (geom.hasAttribute('color')) geom.deleteAttribute('color');

            // --- FORCED LIGHT GREY MATERIAL ---
            const mat = new THREE.MeshBasicMaterial({
              color: 0xdddddd,
              transparent: xray,
              opacity: xray ? 0.5 : 1,
            });

            mat.map = null;
            mat.vertexColors = false;

            child.material = mat;

            // --- EDGE LINES ---
            const edges = new THREE.EdgesGeometry(geom);
            const edgeLines = new THREE.LineSegments(
              edges,
              new THREE.LineBasicMaterial({ color: 0x000000 })
            );

            child.userData.edgeLines = edgeLines;
            child.add(edgeLines);

            edgeLines.visible = wireframe;
          }
        });




        root.add(gltf.scene);
      } catch (e) {
        console.warn('Failed to load GLB asset', asset, e);
      }
    };
    loadAsset();
  }, [currentPage, wireframe, xray]);

  const resetCamera = () => {
    const cam = cameraRef.current!;
    cam.position.set(0, 1.4, 2.8);
    controlsRef.current?.target.set(0, 0, 0);
    controlsRef.current?.update();
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4 }}>
        <button onClick={resetCamera}>Reset Camera</button>
        <button onClick={() => setWireframe(w => !w)}>Wireframe</button>
        <button onClick={() => setXray(x => !x)}>X-Ray</button>
      </div>
    </div>
  );
}
