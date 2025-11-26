import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Background Color - Match Slate-50 but slightly adjusted for 3D depth
    scene.background = new THREE.Color(0xf8fafc); 
    // Add some fog for depth
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.001);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 400; // Move camera back
    camera.position.y = 100; // Move camera up slightly
    camera.lookAt(0,0,0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Particles Wave ---
    const particleCount = 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    let i = 0;
    const sep = 80; // Separation
    
    // Create a grid of particles
    for (let ix = 0; ix < 60; ix++) {
      for (let iy = 0; iy < 30; iy++) {
        positions[i] = ix * sep - ((60 * sep) / 2); // x
        positions[i + 1] = 0; // y (will be animated)
        positions[i + 2] = iy * sep - ((30 * sep) / 2); // z

        scales[i / 3] = 1;
        i += 3;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const material = new THREE.PointsMaterial({
      color: 0x3b82f6, // Brand Blue
      size: 4,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // --- Animation Loop ---
    let count = 0;
    const animate = () => {
      requestAnimationFrame(animate);

      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        let i = 0;
        count += 0.03; // Speed of wave

        for (let ix = 0; ix < 60; ix++) {
          for (let iy = 0; iy < 30; iy++) {
            // Sine wave calculation for Y position
            // Combine multiple sine waves for organic fluid motion
            const x = positions[i];
            const z = positions[i+2];
            
            positions[i + 1] = (Math.sin((ix + count) * 0.3) * 30) +
                               (Math.sin((iy + count) * 0.5) * 30);
            
            // Gentle scale pulsation
            // const scale = (Math.sin((ix + count) * 0.3) + 1) * 2 + (Math.sin((iy + count) * 0.5) + 1) * 2;
            
            i += 3;
          }
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
        
        // Slight rotation for dynamic feel
        // particlesRef.current.rotation.y += 0.0005;
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      // Dispose geometry/materials to prevent leaks
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none" 
      style={{ zIndex: 0 }}
    />
  );
};