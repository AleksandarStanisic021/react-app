import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CarScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    // Mario 64 style bright blue sky background
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Helper function to create a car with wheel references
    interface CarGroup extends THREE.Group {
      wheels: THREE.Mesh[];
    }

    const createCar = (x: number, z: number, color: number): CarGroup => {
      const carGroup = new THREE.Group() as CarGroup;

      // Car body (main rectangular box)
      // Geometry: width (x) = 1, height (y) = 0.8, length (z) = 2 (forward direction)
      const bodyGeometry = new THREE.BoxGeometry(1, 0.8, 2);
      const bodyMaterial = new THREE.MeshStandardMaterial({ color });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.4;
      carGroup.add(body);

      // Car roof (smaller box on top)
      const roofGeometry = new THREE.BoxGeometry(0.9, 0.6, 1.2);
      const roofMaterial = new THREE.MeshStandardMaterial({ color: color * 0.8 });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(0, 1.1, 0.2);
      carGroup.add(roof);

      // Wheels - positioned correctly for car facing forward (positive Z)
      const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
      const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
      
      // Front left wheel (front = positive Z, left = positive X)
      const wheelFL = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheelFL.rotation.z = Math.PI / 2; // Rotate cylinder to lie flat
      wheelFL.position.set(0.4, 0.3, 0.7); // Front (z=0.7), Left (x=0.4)
      carGroup.add(wheelFL);

      // Front right wheel (front = positive Z, right = negative X)
      const wheelFR = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheelFR.rotation.z = Math.PI / 2;
      wheelFR.position.set(-0.4, 0.3, 0.7); // Front (z=0.7), Right (x=-0.4)
      carGroup.add(wheelFR);

      // Rear left wheel (rear = negative Z, left = positive X)
      const wheelRL = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheelRL.rotation.z = Math.PI / 2;
      wheelRL.position.set(0.4, 0.3, -0.7); // Rear (z=-0.7), Left (x=0.4)
      carGroup.add(wheelRL);

      // Rear right wheel (rear = negative Z, right = negative X)
      const wheelRR = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheelRR.rotation.z = Math.PI / 2;
      wheelRR.position.set(-0.4, 0.3, -0.7); // Rear (z=-0.7), Right (x=-0.4)
      carGroup.add(wheelRR);

      // Windshield (at front of car, positive Z)
      const windshieldGeometry = new THREE.BoxGeometry(0.92, 0.5, 1.1);
      const windshieldMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x88ccff, 
        transparent: true, 
        opacity: 0.6 
      });
      const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
      windshield.position.set(0, 1.0, 0.3); // Front of car (z=0.3)
      carGroup.add(windshield);

      carGroup.position.set(x, 0, z);
      
      // Store wheel references for easy access [Front Left, Front Right, Rear Left, Rear Right]
      carGroup.wheels = [wheelFL, wheelFR, wheelRL, wheelRR];
      
      return carGroup;
    };

    // Create multiple cars with Mario 64 vibrant colors
    const car1 = createCar(-3, 0, 0xFF0000); // Bright red car
    scene.add(car1);

    const car2 = createCar(0, 0, 0x0000FF); // Bright blue car
    scene.add(car2);

    const car3 = createCar(3, 0, 0x00FF00); // Bright green car
    scene.add(car3);

    // Yellow car (player controlled) - Mario 64 style bright yellow
    const yellowCar = createCar(0, -2, 0xFFFF00); // Bright yellow car
    // Car now properly oriented: front faces positive Z when rotation.y = 0
    scene.add(yellowCar);

    // Mario 64 style green grass ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x7CFC00, // Bright green grass color
      roughness: 1.0,
      metalness: 0.0
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Helper function to create Mario 64 style trees
    const createTree = (x: number, z: number, scale: number = 1) => {
      const treeGroup = new THREE.Group();

      // Brown trunk (cylinder)
      const trunkGeometry = new THREE.CylinderGeometry(0.3 * scale, 0.4 * scale, 2 * scale, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = scale;
      treeGroup.add(trunk);

      // Green leaves (sphere on top - Mario 64 style)
      const leavesGeometry = new THREE.SphereGeometry(1.5 * scale, 8, 8);
      const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Forest green
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.y = 2.5 * scale + 0.5 * scale;
      treeGroup.add(leaves);

      treeGroup.position.set(x, 0, z);
      return treeGroup;
    };

    // Create trees scattered around (Mario 64 style)
    const trees = [
      createTree(-10, -10, 1.2),
      createTree(15, -8, 1.0),
      createTree(-8, 12, 1.1),
      createTree(12, 10, 1.3),
      createTree(-15, 5, 0.9),
      createTree(18, -12, 1.1),
      createTree(-12, -15, 1.2),
      createTree(8, 15, 1.0),
      createTree(20, 8, 1.1),
      createTree(-18, -8, 1.0),
      createTree(-5, -20, 1.2),
      createTree(15, -18, 1.1),
    ];
    trees.forEach(tree => scene.add(tree));

    // Mario 64 style clouds (simple white spheres)
    const createCloud = (x: number, y: number, z: number, scale: number = 1) => {
      const cloudGroup = new THREE.Group();
      const cloudMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0.3
      });

      // Cloud made of overlapping spheres
      const cloudSize = 2 * scale;
      const positions = [
        [0, 0, 0],
        [cloudSize * 0.6, 0, 0],
        [-cloudSize * 0.6, 0, 0],
        [cloudSize * 0.3, cloudSize * 0.4, 0],
        [-cloudSize * 0.3, cloudSize * 0.4, 0],
      ];

      positions.forEach(([px, py, pz]) => {
        const cloudPart = new THREE.Mesh(
          new THREE.SphereGeometry(cloudSize * 0.5, 8, 8),
          cloudMaterial
        );
        cloudPart.position.set(px, py, pz);
        cloudGroup.add(cloudPart);
      });

      cloudGroup.position.set(x, y, z);
      return cloudGroup;
    };

    // Add clouds in the sky with initial positions stored
    const cloudPositions = [
      { x: -30, y: 25, z: -30, scale: 1.5 },
      { x: 40, y: 30, z: -20, scale: 1.2 },
      { x: -20, y: 28, z: 35, scale: 1.3 },
      { x: 35, y: 32, z: 25, scale: 1.1 },
      { x: -40, y: 27, z: 20, scale: 1.4 },
    ];
    const clouds = cloudPositions.map((pos, index) => {
      const cloud = createCloud(pos.x, pos.y, pos.z, pos.scale);
      (cloud as any).initialX = pos.x;
      (cloud as any).initialZ = pos.z;
      (cloud as any).cloudIndex = index;
      return cloud;
    });
    clouds.forEach(cloud => scene.add(cloud));

    // Mario 64 style bright lighting (sunny day)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Brighter ambient
    scene.add(ambientLight);
    
    // Bright directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Additional fill light for Mario 64 style vibrant colors
    const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.3); // Sky blue fill
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Camera setup - will follow yellow car
    camera.position.set(0, 8, 10);
    camera.lookAt(0, 0, 0);

    // Keyboard controls
    const keys: { [key: string]: boolean } = {};
    
    const handleKeyDown = (event: KeyboardEvent) => {
      keys[event.key.toLowerCase()] = true;
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      keys[event.key.toLowerCase()] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Car physics/control variables
    let carSpeed = 0;
    const maxSpeed = 0.15;
    const acceleration = 0.005;
    const deceleration = 0.01;
    const rotationSpeed = 0.03;
    const wheelRotationSpeed = 0.3;

    // Animation time for trees and clouds
    let animationTime = 0;

    let reqId: number;
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    const animate = () => {
      animationTime += 0.016; // Approximate frame time
      // Handle yellow car controls (WASD)
      if (keys['w']) {
        carSpeed = Math.min(carSpeed + acceleration, maxSpeed);
      } else if (keys['s']) {
        carSpeed = Math.max(carSpeed - acceleration, -maxSpeed * 0.7); // Slower reverse
      } else {
        // Decelerate
        if (carSpeed > 0) {
          carSpeed = Math.max(carSpeed - deceleration, 0);
        } else if (carSpeed < 0) {
          carSpeed = Math.min(carSpeed + deceleration, 0);
        }
      }

      // Steering controls (A/D)
      // Rotation speed is proportional to current speed for realistic turning
      const effectiveRotationSpeed = rotationSpeed * (Math.abs(carSpeed) / maxSpeed + 0.3);
      
      if (keys['a']) {
        // Turn left: rotation direction depends on whether moving forward or backward
        // When reversing, steering is inverted
        const turnDirection = carSpeed >= 0 ? 1 : -1;
        yellowCar.rotation.y += effectiveRotationSpeed * turnDirection;
        
        // Rotate front wheels for steering visual
        yellowCar.wheels[0].rotation.y = Math.min(yellowCar.wheels[0].rotation.y + 0.05, 0.6);
        yellowCar.wheels[1].rotation.y = Math.min(yellowCar.wheels[1].rotation.y + 0.05, 0.6);
      } else if (keys['d']) {
        // Turn right: rotation direction depends on whether moving forward or backward
        const turnDirection = carSpeed >= 0 ? 1 : -1;
        yellowCar.rotation.y -= effectiveRotationSpeed * turnDirection;
        
        // Rotate front wheels for steering visual
        yellowCar.wheels[0].rotation.y = Math.max(yellowCar.wheels[0].rotation.y - 0.05, -0.6);
        yellowCar.wheels[1].rotation.y = Math.max(yellowCar.wheels[1].rotation.y - 0.05, -0.6);
      } else {
        // Return wheels to center when not steering
        yellowCar.wheels[0].rotation.y *= 0.85;
        yellowCar.wheels[1].rotation.y *= 0.85;
      }

      // Move car based on its rotation and speed
      // Adjust for 90-degree offset: car's front naturally faces positive X
      if (Math.abs(carSpeed) > 0.001) {
        // Move forward/backward based on car's current rotation
        // Add Math.PI/2 offset because car's front faces X, not Z
        const adjustedRotation = yellowCar.rotation.y + Math.PI / 2;
        yellowCar.position.x += Math.cos(adjustedRotation) * carSpeed;
        yellowCar.position.z += Math.sin(adjustedRotation) * carSpeed;

        // Rotate all wheels when moving (forward or backward)
        yellowCar.wheels.forEach((wheel: THREE.Mesh) => {
          wheel.rotation.x += wheelRotationSpeed * Math.abs(carSpeed) * (carSpeed >= 0 ? 1 : -1);
        });
      }

      // Rotate other cars slightly for visual interest
      car1.rotation.y += 0.005;
      car2.rotation.y -= 0.005;
      car3.rotation.y += 0.005;

      // Rotate wheels of other cars
      car1.wheels.forEach((wheel: THREE.Mesh) => {
        wheel.rotation.x += 0.05;
      });
      car2.wheels.forEach((wheel: THREE.Mesh) => {
        wheel.rotation.x += 0.05;
      });
      car3.wheels.forEach((wheel: THREE.Mesh) => {
        wheel.rotation.x += 0.05;
      });

      // Mario 64 style tree sway animation (gentle wind effect)
      trees.forEach((tree, index) => {
        const swayAmount = Math.sin(animationTime * 0.5 + index) * 0.02;
        tree.rotation.z = swayAmount;
      });

      // Mario 64 style cloud drift animation (slow, peaceful movement)
      clouds.forEach((cloud) => {
        const cloudAny = cloud as any;
        const driftAmount = 10;
        cloud.position.x = cloudAny.initialX + Math.sin(animationTime * 0.1 + cloudAny.cloudIndex) * driftAmount;
        cloud.position.z = cloudAny.initialZ + Math.cos(animationTime * 0.08 + cloudAny.cloudIndex) * driftAmount * 0.5;
      });

      // Camera follows yellow car
      // Standard camera offset behind car (car faces positive Z)
      const cameraOffset = new THREE.Vector3(
        Math.sin(yellowCar.rotation.y) * -8,
        6,
        Math.cos(yellowCar.rotation.y) * -8
      );
      camera.position.lerp(
        new THREE.Vector3(
          yellowCar.position.x + cameraOffset.x,
          yellowCar.position.y + cameraOffset.y,
          yellowCar.position.z + cameraOffset.z
        ),
        0.1
      );
      camera.lookAt(yellowCar.position);
      
      renderer.render(scene, camera);
      reqId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', onResize);
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '400px' }} />;
}
