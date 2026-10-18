'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCw, Box, Eye, RefreshCw, ZoomIn } from 'lucide-react';

interface ThreeDViewerProps {
  modelUrl: string;
  className?: string;
  autoRotate?: boolean;
}

export default function ThreeDViewer({ modelUrl, className = "h-96 w-full", autoRotate = true }: ThreeDViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isRotating, setIsRotating] = useState(autoRotate);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#F4F4F6');

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 2.5);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Clear previous children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 2.0;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(5, 10, 7);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8975D9, 0.8); // Subtle brand lavender rim light
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // Subtle luxury ground contact shadow plane
    const shadowGeo = new THREE.PlaneGeometry(10, 10);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const ground = new THREE.Mesh(shadowGeo, shadowMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // 6. Load GLTF / GLB Model
    setLoading(true);
    setError(null);
    const loader = new GLTFLoader();

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        // Center and scale model neatly inside view
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.2 / maxDim;

        model.scale.set(scale, scale, scale);
        model.position.sub(center.multiplyScalar(scale));
        model.position.y = 0.2; // Sit gracefully on shadow ground

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(model);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('Failed to load 3D model:', err);
        setError('3D model preview is currently loading or converting format.');
        setLoading(false);
      }
    );

    // 7. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.autoRotate = isRotating;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize listener
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl, isRotating]);

  // Toggle wireframe mode
  const toggleWireframe = () => {
    if (!modelRef.current) return;
    const nextState = !isWireframe;
    setIsWireframe(nextState);
    modelRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => {
            if ('wireframe' in m) (m as THREE.MeshStandardMaterial).wireframe = nextState;
          });
        } else if (mesh.material && 'wireframe' in mesh.material) {
          (mesh.material as THREE.MeshStandardMaterial).wireframe = nextState;
        }
      }
    });
  };

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl bg-[#F4F4F6] border border-brand-border ${className}`}>
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F4F4F6]/80 backdrop-blur-sm z-10">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-lavender border-t-transparent" />
          <p className="mt-3 text-xs tracking-wider uppercase font-medium text-brand-charcoal">
            Rendering 3D Model...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-white/90">
          <Box className="h-10 w-10 text-brand-secondary mb-2" />
          <p className="text-sm font-medium text-brand-charcoal">3D Asset Interactive Preview</p>
          <p className="text-xs text-brand-secondary mt-1 max-w-xs">{error}</p>
        </div>
      )}

      {/* Interactive Controls Overlay */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        <div className="flex items-center gap-1.5 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-brand-border/60 shadow-subtle pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsRotating(!isRotating)}
            title={isRotating ? "Pause rotation" : "Start auto-rotation"}
            className={`p-1.5 rounded-full transition-colors ${isRotating ? 'text-brand-lavender bg-brand-lavender/10' : 'text-brand-secondary hover:text-brand-charcoal'}`}
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleWireframe}
            title={isWireframe ? "Solid view" : "Wireframe inspection"}
            className={`p-1.5 rounded-full transition-colors ${isWireframe ? 'text-brand-lavender bg-brand-lavender/10' : 'text-brand-secondary hover:text-brand-charcoal'}`}
          >
            <Box className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={resetCamera}
            title="Reset viewpoint"
            className="p-1.5 rounded-full text-brand-secondary hover:text-brand-charcoal transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="bg-brand-charcoal/80 backdrop-blur-md text-white text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full font-mono font-medium pointer-events-auto">
          3D Interactive GLB
        </div>
      </div>
    </div>
  );
}
