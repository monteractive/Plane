import * as THREE from 'three';
import { createPlane } from './planeModel.js';
import { createCity } from './cityModel.js';
import { PlaneControls } from './planeControls.js';
import { FollowCamera } from './followCamera.js';
import { GameUI } from './gameUI.js';
import { createSkybox, createClouds } from './skybox.js';

// Scene setup
const scene = new THREE.Scene();
// Remove the background color as we'll use a skybox instead
// scene.background = new THREE.Color(0x87CEEB);

// Create procedural textures
function createMetalTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Create metallic texture with scratches
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);

    // Add noise and scratches
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const brightness = Math.random() * 30 - 15;
        ctx.fillStyle = `rgba(128, 128, 128, ${brightness}%)`;
        ctx.fillRect(x, y, 2, 1);
    }

    return new THREE.CanvasTexture(canvas);
}

function createBuildingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base building color
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(0, 0, 256, 512);

    // Add windows
    ctx.fillStyle = '#3a3a3a';
    for (let y = 16; y < 512; y += 40) {
        for (let x = 16; x < 256; x += 40) {
            ctx.fillRect(x, y, 24, 32);
        }
    }

    // Add some variation
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, 2, 2);
    }

    return new THREE.CanvasTexture(canvas);
}

// Create textures
const metalTexture = createMetalTexture();
metalTexture.wrapS = THREE.RepeatWrapping;
metalTexture.wrapT = THREE.RepeatWrapping;

const buildingTexture = createBuildingTexture();
buildingTexture.wrapS = THREE.RepeatWrapping;
buildingTexture.wrapT = THREE.RepeatWrapping;

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(15, 15, 30);

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Add skybox
const skybox = createSkybox();
scene.add(skybox);

// Add clouds
const clouds = createClouds(40); // Create 40 clouds
scene.add(clouds);

// Create and add city to scene
const city = createCity();
scene.add(city);

// Create plane
const { plane, propellerGroup } = createPlane();
scene.add(plane);

// Initialize plane controls
const planeControls = new PlaneControls(plane);
planeControls.setProps({ propellerGroup });

// Initialize follow camera with improved settings
const followCamera = new FollowCamera(camera, plane, {
    damping: 0.04,           // Responsive camera movement
    rotationDamping: 0.06,   // Smooth camera rotation
    minDistance: 5,          // Minimum distance behind plane
    maxDistance: 10,         // Maximum distance behind plane
    heightOffset: 1.5        // Camera height above plane
});

// Camera modes
const CAMERA_MODES = {
    FOLLOW: 'follow',
    EXTERNAL: 'external'
};

let currentCameraMode = CAMERA_MODES.FOLLOW;
let externalCameraPosition = new THREE.Vector3(30, 20, 30);
let externalCameraTarget = new THREE.Vector3(0, 0, 0);

// Create an object to track camera state for UI
const cameraInfo = {
    mode: currentCameraMode
};

// Toggle camera mode with 'C' key
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'c') {
        if (currentCameraMode === CAMERA_MODES.FOLLOW) {
            // Switch to external camera
            currentCameraMode = CAMERA_MODES.EXTERNAL;
            // Store current plane position as target
            externalCameraTarget.copy(plane.position);
            camera.position.copy(externalCameraPosition);
            camera.lookAt(externalCameraTarget);
            // Update camera info for UI
            cameraInfo.mode = currentCameraMode;
        } else {
            // Switch back to follow camera
            currentCameraMode = CAMERA_MODES.FOLLOW;
            // Force immediate update of follow camera
            followCamera.currentPosition.set(0, 0, 0);
            followCamera.currentLookAt.set(0, 0, 0);
            followCamera.updateCamera(1);
            // Update camera info for UI
            cameraInfo.mode = currentCameraMode;
        }
    }
});

// Track C key state for UI indicator
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'c') {
        if (planeControls.keyState.hasOwnProperty('c')) {
            planeControls.keyState.c = true;
        }
        event.preventDefault();
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key.toLowerCase() === 'c') {
        if (planeControls.keyState.hasOwnProperty('c')) {
            planeControls.keyState.c = false;
        }
        event.preventDefault();
    }
});

// Initialize UI with camera info
const gameUI = new GameUI(planeControls, cameraInfo);

// Set initial speed (ensure it's applied correctly)
planeControls.speed = planeControls.minSpeed;
console.log("Initial speed set to:", planeControls.speed);

// Clock for deltaTime calculation
const clock = new THREE.Clock();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Calculate deltaTime for consistent physics
    const deltaTime = clock.getDelta();
    
    // Rotate clouds very slowly for subtle movement
    clouds.children.forEach(cloud => {
        cloud.position.x += Math.sin(cloud.rotation.z) * 0.05;
        cloud.position.z += Math.cos(cloud.rotation.z) * 0.05;
    });
    
    // Update plane controls and physics
    planeControls.update(deltaTime);
    
    // Update camera based on current mode
    if (currentCameraMode === CAMERA_MODES.FOLLOW) {
        // Update follow camera
        followCamera.updateCamera(deltaTime);
    } else {
        // External camera remains stationary
    }
    
    // Update UI
    gameUI.update();
    
    // Render scene
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation loop
animate(); 