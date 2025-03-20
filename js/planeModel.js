import * as THREE from 'three';

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

// Create plane model
export function createPlane() {
    const plane = new THREE.Group();

    // Create textures
    const metalTexture = createMetalTexture();
    metalTexture.wrapS = THREE.RepeatWrapping;
    metalTexture.wrapT = THREE.RepeatWrapping;

    // Materials
    const metalMaterial = new THREE.MeshPhongMaterial({ 
        map: metalTexture,
        shininess: 60,
        bumpMap: metalTexture,
        bumpScale: 0.05
    });

    // Fuselage
    const fuselageGeometry = new THREE.BoxGeometry(0.6, 0.6, 4);
    const fuselage = new THREE.Mesh(fuselageGeometry, metalMaterial);
    plane.add(fuselage);

    // Wings (split into left and right wings for exact symmetry)
    const wingGeometry = new THREE.BoxGeometry(2.4, 0.1, 0.8);
    const leftWing = new THREE.Mesh(wingGeometry, metalMaterial);
    const rightWing = new THREE.Mesh(wingGeometry, metalMaterial);
    
    // Position wings on either side of fuselage
    leftWing.position.set(-1.5, -0.1, 0);
    rightWing.position.set(1.5, -0.1, 0);
    
    plane.add(leftWing);
    plane.add(rightWing);

    // Tail vertical stabilizer
    const tailVerticalGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.6);
    const tailVertical = new THREE.Mesh(tailVerticalGeometry, metalMaterial);
    tailVertical.position.set(0, 0.2, -1.8);
    plane.add(tailVertical);

    // Tail horizontal stabilizer
    const tailHorizontalGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.4);
    const tailHorizontal = new THREE.Mesh(tailHorizontalGeometry, metalMaterial);
    tailHorizontal.position.set(0, 0.1, -1.8);
    plane.add(tailHorizontal);

    // Propeller hub
    const hubGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 8);
    const hub = new THREE.Mesh(hubGeometry, metalMaterial);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(0, 0, 2.1);
    plane.add(hub);

    // Propeller blades
    const propellerGroup = new THREE.Group();
    const bladeGeometry = new THREE.BoxGeometry(1.2, 0.15, 0.05);
    const blade1 = new THREE.Mesh(bladeGeometry, metalMaterial);
    const blade2 = new THREE.Mesh(bladeGeometry, metalMaterial);
    blade2.rotation.z = Math.PI / 2;
    propellerGroup.add(blade1, blade2);
    propellerGroup.position.set(0, 0, 2.2);
    plane.add(propellerGroup);

    // Position the plane higher above the city
    plane.position.y = 10;

    // Ensure plane model points forward (nose away from camera)
    plane.rotation.y = 0;
    
    return { plane, propellerGroup };
} 