import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import RAPIER from '@dimforge/rapier3d-compat';

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

    // Helper function to load a 3D car model and setup
    interface CarGroup extends THREE.Group {
      wheels: THREE.Mesh[];
      isLoaded: boolean;
    }

    const loader = new GLTFLoader();
    
    // Function to load 3D car models from URLs
    // Replace URLs with actual car model URLs (GLTF/GLB format)
    // Free car models available at:
    // - Sketchfab (with CC license): https://sketchfab.com/3d-models?features=downloadable&q=car
    // - Poly Haven: https://polyhaven.com/models
    // - Free3D: https://free3d.com/3d-models/car
    const loadCarModel = (url: string, x: number, z: number, color: number = 0xFFFFFF): Promise<CarGroup> => {
      return new Promise((resolve) => {
        const carGroup = new THREE.Group() as CarGroup;
        carGroup.wheels = [];
        carGroup.isLoaded = false;
        carGroup.position.set(x, 0, z);

        loader.load(
          url,
          (gltf) => {
            const carModel = gltf.scene.clone(); // Clone to avoid issues with multiple instances
            
            // Scale and orient the model appropriately (may need adjustment based on model)
            carModel.scale.set(1, 1, 1);
            
            // Try to find wheels in the model
            const findWheels = (object: THREE.Object3D): THREE.Mesh[] => {
              const wheels: THREE.Mesh[] = [];
              object.traverse((child) => {
                if (child instanceof THREE.Mesh && 
                    (child.name.toLowerCase().includes('wheel') || 
                     child.name.toLowerCase().includes('tire') ||
                     child.name.toLowerCase().includes('rim'))) {
                  wheels.push(child);
                }
              });
              return wheels;
            };

            let wheels = findWheels(carModel);
            
            // If no wheels found in model, create placeholder wheels
            if (wheels.length < 4) {
              const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.35, 16);
              const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
              
              const wheelFL = new THREE.Mesh(wheelGeometry, wheelMaterial);
              wheelFL.rotation.z = Math.PI / 2;
              wheelFL.position.set(0.4, 0.3, 0.7);
              wheelFL.name = 'wheelFL';
              carModel.add(wheelFL);
              
              const wheelFR = new THREE.Mesh(wheelGeometry, wheelMaterial);
              wheelFR.rotation.z = Math.PI / 2;
              wheelFR.position.set(-0.4, 0.3, 0.7);
              wheelFR.name = 'wheelFR';
              carModel.add(wheelFR);
              
              const wheelRL = new THREE.Mesh(wheelGeometry, wheelMaterial);
              wheelRL.rotation.z = Math.PI / 2;
              wheelRL.position.set(0.4, 0.3, -0.7);
              wheelRL.name = 'wheelRL';
              carModel.add(wheelRL);
              
              const wheelRR = new THREE.Mesh(wheelGeometry, wheelMaterial);
              wheelRR.rotation.z = Math.PI / 2;
              wheelRR.position.set(-0.4, 0.3, -0.7);
              wheelRR.name = 'wheelRR';
              carModel.add(wheelRR);
              
              wheels = [wheelFL, wheelFR, wheelRL, wheelRR];
            }

            // Apply color to car body if specified
            if (color !== 0xFFFFFF) {
              carModel.traverse((child) => {
                if (child instanceof THREE.Mesh && 
                    !child.name.toLowerCase().includes('wheel') &&
                    !child.name.toLowerCase().includes('tire') &&
                    !child.name.toLowerCase().includes('rim') &&
                    !child.name.toLowerCase().includes('glass') &&
                    !child.name.toLowerCase().includes('window')) {
                  if (child.material instanceof THREE.MeshStandardMaterial) {
                    child.material.color.setHex(color);
                  } else if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                      if (mat instanceof THREE.MeshStandardMaterial) {
                        mat.color.setHex(color);
                      }
                    });
                  }
                }
              });
            }

            carGroup.add(carModel);
            carGroup.wheels = wheels.slice(0, 4); // Ensure we have exactly 4 wheels
            carGroup.isLoaded = true;
            resolve(carGroup);
          },
          (progress) => {
            // Loading progress
            if (progress.total > 0) {
              const percent = (progress.loaded / progress.total * 100).toFixed(0);
              console.log(`Loading car model: ${percent}%`);
            }
          },
          (error) => {
            console.error('Error loading car model:', error);
            // Fallback: create a simple geometric car if model fails to load
            const fallbackCar = createFallbackCar(x, z, color);
            resolve(fallbackCar);
          }
        );
      });
    };

    // Fallback function to create a simple car if model loading fails
    const createFallbackCar = (x: number, z: number, color: number): CarGroup => {
      const carGroup = new THREE.Group() as CarGroup;

      const bodyGeometry = new THREE.BoxGeometry(1, 0.8, 2);
      const bodyMaterial = new THREE.MeshStandardMaterial({ color });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.4;
      carGroup.add(body);

      const roofGeometry = new THREE.BoxGeometry(0.9, 0.6, 1.2);
      const roofMaterial = new THREE.MeshStandardMaterial({ color: color * 0.8 });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(0, 1.1, 0.2);
      carGroup.add(roof);

      const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.35, 16);
      const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
      
      // Front left wheel
      const wheelFL = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheelFL.rotation.z = Math.PI / 2; // Rotate to lie flat
      wheelFL.position.set(0.4, 0.3, 0.7);
      carGroup.add(wheelFL);

      // Front right wheel
      const wheelFR = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheelFR.rotation.z = Math.PI / 2; // Rotate to lie flat
      wheelFR.position.set(-0.4, 0.3, 0.7);
      carGroup.add(wheelFR);

      // Rear left wheel
      const wheelRL = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheelRL.rotation.z = Math.PI / 2; // Rotate to lie flat
      wheelRL.position.set(0.4, 0.3, -0.7);
      carGroup.add(wheelRL);

      // Rear right wheel
      const wheelRR = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheelRR.rotation.z = Math.PI / 2; // Rotate to lie flat
      wheelRR.position.set(-0.4, 0.3, -0.7);
      carGroup.add(wheelRR);

      carGroup.position.set(x, 0, z);
      carGroup.wheels = [wheelFL, wheelFR, wheelRL, wheelRR];
      carGroup.isLoaded = true;
      
      // Initialize wheel rotation accumulator to prevent flickering
      (carGroup as any).wheelRollRotation = 0;
      (carGroup as any).steeringAngle = 0;
      
      return carGroup;
    };

    // Car references
    let car1: CarGroup;
    let car2: CarGroup;
    let car3: CarGroup;
    let yellowCar: CarGroup;

    // Function to create fallback geometric cars
    const createFallbackCars = () => {
      car1 = createFallbackCar(-3, 0, 0xFF0000);
      scene.add(car1);

      car2 = createFallbackCar(0, 0, 0x0000FF);
      scene.add(car2);

      car3 = createFallbackCar(3, 0, 0x00FF00);
      scene.add(car3);

      yellowCar = createFallbackCar(0, -2, 0xFFFF00);
      scene.add(yellowCar);
    };

    // CAR MODEL CONFIGURATION
    // To use 3D car models from the internet, replace these URLs with actual GLTF/GLB car model URLs
    // Set USE_3D_MODELS to true and provide valid URLs below
    const USE_3D_MODELS = false; // Set to true to load 3D models from URLs
    const CAR_MODEL_URLS = [
      'https://your-car-model-url-1.glb', // Red car - replace with actual URL
      'https://your-car-model-url-2.glb', // Blue car - replace with actual URL
      'https://your-car-model-url-3.glb', // Green car - replace with actual URL
      'https://your-car-model-url-4.glb', // Yellow car - replace with actual URL
    ];

    // WHERE TO FIND FREE CAR MODELS (CC0/Public Domain - no attribution required):
    // 
    // 1. SKETCHFAB - CC0 Concept Cars (High Quality):
    //    - FREE Concept Car 011: https://sketchfab.com/3d-models/free-concept-car-011-public-domain-cc0-099f72bca4494ef9af317e8d76cd99af
    //    - FREE Concept Car 004: https://sketchfab.com/3d-models/free-concept-car-004-public-domain-cc0-4cba124633eb494eadc3bb0c4660ad7e
    //    - FREE Concept Car 025: https://sketchfab.com/3d-models/free-concept-car-025-public-domain-cc0-e3a65443d3e44c33b594cec591c01c05
    //    - FREE Concept Car 040: https://sketchfab.com/3d-models/free-concept-car-040-public-domain-cc0-9363e93183274ea1bad403ea6fe3ee79
    //    - Search more: https://sketchfab.com/3d-models?features=downloadable&q=car&sort_by=-likeCount
    //    - Download: Click "Download 3D Model" → Select GLB format
    //
    // 2. POLY PIZZA / QUATERNIUS (Low-Poly, Game-Ready):
    //    - Car Pack (8 models): https://quaternius.com/packs/cars.html
    //    - Individual models: https://poly.pizza/bundle/Cars-Bundle-FE5IWe6OMk
    //    - Car: https://poly.pizza/m/unqqkULtRU
    //    - SUV: https://poly.pizza/m/xsMtZhBkxL
    //    - Rover: https://poly.pizza/m/WRd1piJOfh
    //    - All free for personal and commercial use
    //
    // 3. CG 3D:
    //    - Various free car models in GLB/GLTF: https://cg3d.org
    //
    // 4. 3DMETASEA:
    //    - Military vehicles and car kits: https://3dmetasea.com
    //
    // HOSTING YOUR MODELS:
    // 1. Put GLB files in your /public folder (e.g., public/models/car1.glb)
    //    Then use: '/models/car1.glb' as the URL
    // 2. Use a CDN like:
    //    - Cloudinary (free tier)
    //    - GitHub Releases (upload files and use raw.githubusercontent.com URLs)
    //    - jsDelivr (via GitHub releases)
    //    - AWS S3 / CloudFront
    //
    // FORMAT: Make sure models are in GLTF (.gltf) or GLB (.glb) format
    
    if (USE_3D_MODELS && CAR_MODEL_URLS.every(url => url.includes('your-car-model-url'))) {
      console.warn('Please provide actual car model URLs in CAR_MODEL_URLS array');
    }

    // Create cars - using 3D models if enabled, otherwise fallback geometric cars
    if (USE_3D_MODELS) {
      // Load 3D models asynchronously
      Promise.all([
        loadCarModel(CAR_MODEL_URLS[0] || '', -3, 0, 0xFF0000),
        loadCarModel(CAR_MODEL_URLS[1] || '', 0, 0, 0x0000FF),
        loadCarModel(CAR_MODEL_URLS[2] || '', 3, 0, 0x00FF00),
        loadCarModel(CAR_MODEL_URLS[3] || '', 0, -2, 0xFFFF00),
      ]).then(([loadedCar1, loadedCar2, loadedCar3, loadedYellowCar]) => {
        car1 = loadedCar1;
        car2 = loadedCar2;
        car3 = loadedCar3;
        yellowCar = loadedYellowCar;
        
        scene.add(car1);
        scene.add(car2);
        scene.add(car3);
        scene.add(yellowCar);
      }).catch(error => {
        console.error('Error loading car models, using fallback:', error);
        // Fallback to geometric cars on error
        createFallbackCars();
      });
    } else {
      // Use geometric fallback cars (current implementation)
      createFallbackCars();
    }

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

    // Initialize Rapier Physics
    let world: RAPIER.World;
    let physicsObjects: { mesh: THREE.Object3D; body: RAPIER.RigidBody; collider?: RAPIER.Collider }[] = [];
    let yellowCarBody: RAPIER.RigidBody | null = null;

    // Initialize physics asynchronously
    RAPIER.init().then(() => {
      // Create physics world with gravity
      const gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
      world = new RAPIER.World(gravity);

      // Create static ground collider
      const groundColliderDesc = RAPIER.ColliderDesc.cuboid(100, 0.1, 100);
      const groundBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
      world.createCollider(groundColliderDesc, groundBody);
      
      // Function to create physics body for yellow car
      const createYellowCarPhysics = () => {
        if (!yellowCar || !yellowCar.isLoaded) return;

        // Create dynamic rigid body for the car
        const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(yellowCar.position.x, yellowCar.position.y + 0.5, yellowCar.position.z)
          .setRotation(new RAPIER.Quaternion(0, 0, 0, 1));
        
        yellowCarBody = world.createRigidBody(bodyDesc);
        
        // Create a box collider for the car (approximate car shape)
        const carSize = new RAPIER.Vector3(0.5, 0.4, 1.0);
        const carColliderDesc = RAPIER.ColliderDesc.cuboid(carSize.x, carSize.y, carSize.z)
          .setDensity(100) // Car mass (density * volume)
          .setFriction(0.7) // Good friction for car tires
          .setRestitution(0.1); // Low bounce
        
        world.createCollider(carColliderDesc, yellowCarBody);
        
        // Store reference
        physicsObjects.push({ mesh: yellowCar, body: yellowCarBody });
      };

      // Create physics for yellow car once it's loaded
      if (yellowCar && yellowCar.isLoaded) {
        createYellowCarPhysics();
      } else {
        // Wait for car to load
        const checkCarLoaded = setInterval(() => {
          if (yellowCar && yellowCar.isLoaded) {
            createYellowCarPhysics();
            clearInterval(checkCarLoaded);
          }
        }, 100);
      }
    });

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
    const enginePower = 1500.0; // Force applied when accelerating
    const maxSteerAngle = 0.6; // Maximum steering angle in radians
    const steerSpeed = 0.05; // How fast steering changes
    const wheelRotationSpeed = 0.3;
    const damping = 0.95; // Linear damping for realistic slowdown
    const angularDamping = 0.9; // Angular damping to prevent spinning

    // Animation time for trees and clouds
    let animationTime = 0;
    let lastTime = performance.now() / 1000;

    let reqId: number;
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    const animate = () => {
      const currentTime = performance.now() / 1000;
      const deltaTime = Math.min(currentTime - lastTime, 0.033); // Cap at ~30fps minimum
      lastTime = currentTime;
      
      animationTime += deltaTime;

      // Apply physics-based car controls and step physics world if initialized
      if (world && yellowCarBody && yellowCar && yellowCar.isLoaded && yellowCar.wheels && yellowCar.wheels.length >= 4) {
          // Get current velocity
          const linvel = yellowCarBody.linvel();
          
          // Get car's rotation (we'll sync it from physics, so use Three.js rotation for calculations)
          const carRotation = yellowCar.rotation.y;
          
          // Calculate forward direction based on rotation (positive Z is forward in Three.js)
          const forwardX = Math.sin(carRotation);
          const forwardZ = Math.cos(carRotation);
          
          // Get current speed
          const currentSpeed = Math.sqrt(linvel.x * linvel.x + linvel.z * linvel.z);
          
          // Handle steering (A/D)
          let steeringAngle = (yellowCar as any).steeringAngle || 0;
          let targetSteer = 0;
          
          if (keys['a']) {
            targetSteer = maxSteerAngle;
          } else if (keys['d']) {
            targetSteer = -maxSteerAngle;
          }
          
          // Smooth steering transition
          steeringAngle += (targetSteer - steeringAngle) * steerSpeed;
          (yellowCar as any).steeringAngle = steeringAngle;
          
          // Handle acceleration/braking (W/S)
          let engineForce = 0;
          if (keys['w']) {
            engineForce = enginePower;
          } else if (keys['s']) {
            engineForce = -enginePower * 0.7; // Slower reverse
          }
          
          // Apply engine force in car's forward direction
          if (Math.abs(engineForce) > 0.01) {
            const force = new RAPIER.Vector3(
              forwardX * engineForce * deltaTime,
              0,
              forwardZ * engineForce * deltaTime
            );
            yellowCarBody.applyImpulse(force, true);
          }
          
          // Apply steering torque (turning force)
          if (Math.abs(steeringAngle) > 0.01 && currentSpeed > 0.1) {
            // Steering effectiveness depends on speed
            const steerStrength = Math.min(currentSpeed * 2, 1.0);
            const torque = steeringAngle * 500 * steerStrength * deltaTime;
            yellowCarBody.applyTorqueImpulse(new RAPIER.Vector3(0, torque, 0), true);
          }
          
          // Apply damping for realistic physics
          const currentLinvel = yellowCarBody.linvel();
          yellowCarBody.setLinvel(new RAPIER.Vector3(
            currentLinvel.x * damping,
            currentLinvel.y, // Don't damp Y (gravity)
            currentLinvel.z * damping
          ), true);
          
          const currentAngvel = yellowCarBody.angvel();
          yellowCarBody.setAngvel(new RAPIER.Vector3(
            currentAngvel.x * angularDamping,
            currentAngvel.y * angularDamping,
            currentAngvel.z * angularDamping
          ), true);
          
          // Store values for wheel rotation after physics step
          (yellowCar as any).__currentSpeed = currentSpeed;
          (yellowCar as any).__engineForce = engineForce;
        }
      
      // Step physics world
      if (world) {
        world.step();
      }
      
      // Sync Three.js car position/rotation with physics body
      if (yellowCarBody && yellowCar && yellowCar.isLoaded && yellowCar.wheels && yellowCar.wheels.length >= 4) {
        const bodyPosition = yellowCarBody.translation();
        yellowCar.position.set(bodyPosition.x, bodyPosition.y - 0.5, bodyPosition.z);
        
        const bodyRotation = yellowCarBody.rotation();
        const euler = new THREE.Euler().setFromQuaternion(
          new THREE.Quaternion(bodyRotation.x, bodyRotation.y, bodyRotation.z, bodyRotation.w)
        );
        yellowCar.rotation.y = euler.y;
        
        // Get current speed for wheel rotation
        const linvel = yellowCarBody.linvel();
        const currentSpeed = (yellowCar as any).__currentSpeed || Math.sqrt(linvel.x * linvel.x + linvel.z * linvel.z);
        
        // Calculate wheel rotation based on speed
        const wheelSpeed = currentSpeed * wheelRotationSpeed;
        
        // Initialize wheel roll rotation if not exists
        if (!(yellowCar as any).wheelRollRotation) {
          (yellowCar as any).wheelRollRotation = 0;
        }
        
        // Get steering angle
        const steeringAngle = (yellowCar as any).steeringAngle || 0;
        
        // Update wheel roll rotation based on movement direction
        const engineForce = (yellowCar as any).__engineForce || 0;
        const direction = engineForce >= 0 ? 1 : -1;
        (yellowCar as any).wheelRollRotation += wheelSpeed * direction * deltaTime;
        
        // Normalize to prevent infinite growth
        if (Math.abs((yellowCar as any).wheelRollRotation) > Math.PI * 20) {
          (yellowCar as any).wheelRollRotation = (yellowCar as any).wheelRollRotation % (Math.PI * 2);
        }
        
        // Apply wheel rotations
        yellowCar.wheels.forEach((wheel: THREE.Mesh, index: number) => {
          if (wheel) {
            wheel.rotation.x = (yellowCar as any).wheelRollRotation;
            
            // Steering rotation for front wheels only
            if (index === 0 || index === 1) {
              wheel.rotation.y = steeringAngle;
            } else {
              wheel.rotation.y = 0;
            }
          }
        });
      } else if (yellowCar && yellowCar.isLoaded && yellowCar.wheels && yellowCar.wheels.length >= 4) {
        // Fallback: sync visual with physics body if it exists but isn't fully set up
        if (yellowCarBody) {
          const bodyPosition = yellowCarBody.translation();
          yellowCar.position.set(bodyPosition.x, bodyPosition.y - 0.5, bodyPosition.z);
          
          const bodyRotation = yellowCarBody.rotation();
          const euler = new THREE.Euler().setFromQuaternion(
            new THREE.Quaternion(bodyRotation.x, bodyRotation.y, bodyRotation.z, bodyRotation.w)
          );
          yellowCar.rotation.y = euler.y;
        }
      }

      // Rotate other cars slightly for visual interest (only if loaded)
      if (car1 && car1.isLoaded) {
        car1.rotation.y += 0.005;
        if (car1.wheels) {
          // Initialize wheel roll rotation if needed
          if (!(car1 as any).wheelRollRotation) {
            (car1 as any).wheelRollRotation = 0;
          }
          (car1 as any).wheelRollRotation += 0.05;
          // Normalize to prevent flickering
          if ((car1 as any).wheelRollRotation > Math.PI * 20) {
            (car1 as any).wheelRollRotation = (car1 as any).wheelRollRotation % (Math.PI * 2);
          }
          
          car1.wheels.forEach((wheel: THREE.Mesh) => {
            if (wheel) {
              wheel.rotation.x = (car1 as any).wheelRollRotation;
              wheel.rotation.y = 0;
            }
          });
        }
      }
      if (car2 && car2.isLoaded) {
        car2.rotation.y -= 0.005;
        if (car2.wheels) {
          if (!(car2 as any).wheelRollRotation) {
            (car2 as any).wheelRollRotation = 0;
          }
          (car2 as any).wheelRollRotation += 0.05;
          if ((car2 as any).wheelRollRotation > Math.PI * 20) {
            (car2 as any).wheelRollRotation = (car2 as any).wheelRollRotation % (Math.PI * 2);
          }
          
          car2.wheels.forEach((wheel: THREE.Mesh) => {
            if (wheel) {
              wheel.rotation.x = (car2 as any).wheelRollRotation;
              wheel.rotation.y = 0;
            }
          });
        }
      }
      if (car3 && car3.isLoaded) {
        car3.rotation.y += 0.005;
        if (car3.wheels) {
          if (!(car3 as any).wheelRollRotation) {
            (car3 as any).wheelRollRotation = 0;
          }
          (car3 as any).wheelRollRotation += 0.05;
          if ((car3 as any).wheelRollRotation > Math.PI * 20) {
            (car3 as any).wheelRollRotation = (car3 as any).wheelRollRotation % (Math.PI * 2);
          }
          
          car3.wheels.forEach((wheel: THREE.Mesh) => {
            if (wheel) {
              wheel.rotation.x = (car3 as any).wheelRollRotation;
              wheel.rotation.y = 0;
            }
          });
        }
      }

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
