import * as THREE from 'three';

export class FollowCamera {
    constructor(camera, target, options = {}) {
        this.camera = camera;
        this.target = target;
        
        // Default follow parameters
        this.offset = options.offset || new THREE.Vector3(0, 2, -10); // Position behind and above
        this.damping = options.damping || 0.05; // Reduced damping for closer following
        this.rotationDamping = options.rotationDamping || 0.08; // Reduced for closer following
        this.lookOffset = options.lookOffset || new THREE.Vector3(0, 0, 10); // Look ahead of plane
        
        // Distance parameters
        this.minDistance = options.minDistance || 6; // Minimum distance from plane
        this.maxDistance = options.maxDistance || 12; // Maximum distance from plane
        this.heightOffset = options.heightOffset || 2; // Height above plane
        
        // Current camera values for smooth transitions
        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
        
        // Initialize camera position
        this.updateCamera(1);
    }
    
    updateCamera(deltaTime) {
        if (!this.target) return;
        
        // Get target position and orientation
        this.target.updateMatrixWorld();
        const targetPosition = new THREE.Vector3();
        targetPosition.setFromMatrixPosition(this.target.matrixWorld);
        
        // Create a vector pointing backward from the plane
        const backward = new THREE.Vector3(0, 0, -1);
        backward.applyQuaternion(this.target.quaternion);
        
        // Create a vector pointing upward relative to the plane
        const upward = new THREE.Vector3(0, 1, 0);
        upward.applyQuaternion(this.target.quaternion);
        
        // Calculate desired camera position: behind and above the plane
        const desiredPosition = new THREE.Vector3();
        
        // Adjust the camera distance based on plane pitch
        // When plane pitches up, move camera lower and further back
        // When plane pitches down, move camera higher and closer
        
        // Get plane's forward direction projected onto xz plane
        const forwardXZ = new THREE.Vector3(0, 0, 1);
        forwardXZ.applyQuaternion(this.target.quaternion);
        forwardXZ.y = 0;
        forwardXZ.normalize();
        
        // Calculate pitch angle (angle between forward and forward projected on xz)
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(this.target.quaternion);
        const pitchAngle = Math.asin(forward.y);
        
        // Adjust camera distance and height based on pitch
        let distance = this.minDistance + (this.maxDistance - this.minDistance) * (0.5 - pitchAngle);
        let height = this.heightOffset - pitchAngle * 3; // Lower camera when pitching up
        
        // Calculate desired position
        desiredPosition.copy(targetPosition)
            .add(backward.multiplyScalar(distance)) // Move back
            .add(new THREE.Vector3(0, height, 0)); // Add height
        
        // Calculate camera look-at position (ahead of plane)
        const lookAtPoint = targetPosition.clone().add(forward.normalize().multiplyScalar(10));
        
        // Apply smooth damping to camera movement
        if (!this.currentPosition.length()) {
            this.currentPosition.copy(desiredPosition);
        } else {
            this.currentPosition.lerp(desiredPosition, this.damping * deltaTime * 60);
        }
        
        if (!this.currentLookAt.length()) {
            this.currentLookAt.copy(lookAtPoint);
        } else {
            this.currentLookAt.lerp(lookAtPoint, this.rotationDamping * deltaTime * 60);
        }
        
        // Apply position and look-at to camera
        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
    }
} 