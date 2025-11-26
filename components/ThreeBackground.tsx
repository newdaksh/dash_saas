
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Slate-50 to match app theme
    scene.fog = new THREE.Fog(0xf8fafc, 20, 60); // Soft fog blending

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance" 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x3b82f6, 0.8); // Brand Blue
    dirLight.position.set(15, 20, 10);
    scene.add(dirLight);
    
    const fillLight = new THREE.PointLight(0x93c5fd, 0.5); // Brand 300
    fillLight.position.set(-15, 0, 10);
    scene.add(fillLight);

    // --- Objects (Hexagons) ---
    // Cylinder with 6 segments creates a hexagon
    const geometry = new THREE.CylinderGeometry(1, 1, 0.3, 6);
    
    const shapes: { mesh: THREE.Mesh; speedRot: number; speedY: number; floatOffset: number; initialY: number }[] = [];
    const count = 45;
    
    // Palette: Slate 100-300 and Brand 50-200 for a light, subtle theme
    const palette = [
      0xf1f5f9, // Slate 100
      0xe2e8f0, // Slate 200
      0xdbeafe, // Brand 100
      0xbfdbfe, // Brand 200
      0xe0f2fe, // Sky 100
    ];

    for (let i = 0; i < count; i++) {
      const color = palette[Math.floor(Math.random() * palette.length)];
      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.9,
        flatShading: true,
      });

      const mesh = new THREE.Mesh(geometry, material);
      
      // Position randomly across the view
      const x = (Math.random() - 0.5) * 70;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 25 - 10;
      
      mesh.position.set(x, y, z);
      
      // Random rotation
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.z = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      
      // Random scale variation
      const scale = Math.random() * 0.8 + 0.6;
      mesh.scale.set(scale, scale, scale);

      scene.add(mesh);
      
      shapes.push({
        mesh,
        speedRot: (Math.random() - 0.5) * 0.005,
        speedY: Math.random() * 0.01 + 0.002,
        floatOffset: Math.random() * Math.PI * 2,
        initialY: y
      });
    }

    // --- Interaction ---
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.001;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.001;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth camera parallax
      camera.position.x += (mouseX * 8 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 8 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      // Animate shapes
      shapes.forEach((shape) => {
        // Continuous rotation
        shape.mesh.rotation.x += shape.speedRot;
        shape.mesh.rotation.y += shape.speedRot;
        
        // Gentle vertical wave
        const bob = Math.sin(time * 0.5 + shape.floatOffset) * 1.5;
        
        // Continuous slow rise
        shape.initialY += shape.speedY;
        // Loop back to bottom
        if (shape.initialY > 30) shape.initialY = -30;

        shape.mesh.position.y = shape.initialY + bob;
      });

      renderer.render(scene, camera);
    };

    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
      
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      // Materials handled by GC
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none" 
      style={{ zIndex: 0 }} 
    />
  );
};
