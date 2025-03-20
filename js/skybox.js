import * as THREE from 'three';

// Create a skybox with gradient
export function createSkybox() {
    // Create a large sphere for the sky
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    
    // Create a shader material with gradient
    const vertexShader = `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const fragmentShader = `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
            float h = normalize(vWorldPosition + offset).y;
            gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
    `;
    
    const uniforms = {
        topColor: { value: new THREE.Color(0x0077ff) },     // Sky blue
        bottomColor: { value: new THREE.Color(0xffffff) },  // White/light blue
        offset: { value: 33 },
        exponent: { value: 0.6 }
    };
    
    const skyMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms,
        side: THREE.BackSide
    });
    
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    return sky;
}

// Create clouds
export function createClouds(count = 30) {
    const clouds = new THREE.Group();
    
    // Create cloud texture
    function createCloudTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        ctx.fillRect(0, 0, 512, 512);
        
        // Draw cloud shapes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        
        // Create multiple blob shapes
        for (let i = 0; i < 12; i++) {
            const x = 128 + Math.random() * 256;
            const y = 128 + Math.random() * 256;
            const radius = 40 + Math.random() * 70;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2, true);
            ctx.fill();
        }
        
        return new THREE.CanvasTexture(canvas);
    }
    
    const cloudTexture = createCloudTexture();
    
    // Cloud material
    const cloudMaterial = new THREE.MeshBasicMaterial({
        map: cloudTexture,
        transparent: true,
        depthWrite: false
    });
    
    // Create multiple clouds
    for (let i = 0; i < count; i++) {
        const cloudSize = 10 + Math.random() * 20;
        const cloudGeometry = new THREE.PlaneGeometry(cloudSize, cloudSize);
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial.clone());
        
        // Position clouds randomly in the sky
        const radius = 100 + Math.random() * 200;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.PI / 2 - Math.random() * 0.5; // Keep clouds in upper hemisphere
        
        cloud.position.x = radius * Math.sin(phi) * Math.cos(theta);
        cloud.position.y = 20 + Math.random() * 50;
        cloud.position.z = radius * Math.sin(phi) * Math.sin(theta);
        
        // Rotate clouds to face the origin
        cloud.lookAt(0, cloud.position.y, 0);
        
        // Random rotation
        cloud.rotation.z = Math.random() * Math.PI * 2;
        
        clouds.add(cloud);
    }
    
    return clouds;
} 