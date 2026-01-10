import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // First sphere (blue)
    const geometry1 = new THREE.SphereGeometry(1, 32, 32);
    const material1 = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    const sphere1 = new THREE.Mesh(geometry1, material1);
    sphere1.position.set(-2, 0, 0);
    scene.add(sphere1);

    // Second sphere (red)
    const geometry2 = new THREE.SphereGeometry(1, 32, 32);
    const material2 = new THREE.MeshStandardMaterial({ color: 0xff0077 });
    const sphere2 = new THREE.Mesh(geometry2, material2);
    sphere2.position.set(2, 0, 0);
    scene.add(sphere2);

    // Bounce animation state
    let time1 = 0;
    let time2 = 0;

    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Directional light for shadows and depth
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Red point light
    const redLight = new THREE.PointLight(0xff0000, 1, 100);
    redLight.position.set(-3, 3, 3);
    scene.add(redLight);

    camera.position.z = 5;

    let reqId: number;
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    const animate = () => {
      // Update bounce timing
      time1 += 0.02;
      time2 += 0.025; // Slightly different speed for variety

      // Bounce animation using absolute value of sine for upward bounce effect
      // This creates a bouncing motion that starts high and bounces down
      sphere1.position.y = Math.abs(Math.sin(time1)) * 2 - 1;
      sphere2.position.y = Math.abs(Math.sin(time2)) * 2 - 1;

      // Rotation continues
      sphere1.rotation.x += 0.01;
      sphere1.rotation.y += 0.01;
      sphere2.rotation.x -= 0.01;
      sphere2.rotation.y -= 0.01;
      
      renderer.render(scene, camera);
      reqId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', onResize);
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '400px' }} />;
}
