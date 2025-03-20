import * as THREE from 'three';

// Create procedural building texture
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

// Create city environment
export function createCity() {
    const city = new THREE.Group();

    // Create textures
    const buildingTexture = createBuildingTexture();
    buildingTexture.wrapS = THREE.RepeatWrapping;
    buildingTexture.wrapT = THREE.RepeatWrapping;

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x90EE90,
        side: THREE.DoubleSide 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    city.add(ground);

    // Buildings
    const buildingMaterial = new THREE.MeshPhongMaterial({
        map: buildingTexture,
        shininess: 30
    });

    // Create buildings in a grid
    for (let x = -40; x <= 40; x += 10) {
        for (let z = -40; z <= 40; z += 10) {
            if (Math.random() < 0.3) continue;

            const height = Math.random() * 10 + 5;
            const width = Math.random() * 2 + 2;
            const depth = Math.random() * 2 + 2;

            const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            
            // Scale texture based on building size
            building.material.map.repeat.set(width/2, height/4);
            
            building.position.set(
                x + (Math.random() - 0.5) * 5,
                height / 2 - 5,
                z + (Math.random() - 0.5) * 5
            );
            
            city.add(building);
        }
    }

    // Trees
    const treeMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });

    // Create trees in between buildings
    for (let x = -45; x <= 45; x += 8) {
        for (let z = -45; z <= 45; z += 8) {
            // Skip some positions randomly for variety
            if (Math.random() < 0.7) continue;

            const treeGroup = new THREE.Group();

            // Trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

            // Foliage
            const foliageGeometry = new THREE.ConeGeometry(1, 2, 8);
            const foliage = new THREE.Mesh(foliageGeometry, treeMaterial);
            foliage.position.y = 1.5;

            treeGroup.add(trunk);
            treeGroup.add(foliage);
            treeGroup.position.set(
                x + (Math.random() - 0.5) * 3,
                -4.5,
                z + (Math.random() - 0.5) * 3
            );

            city.add(treeGroup);
        }
    }

    return city;
} 