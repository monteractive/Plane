import * as THREE from 'three';

export class PlaneControls {
    constructor(plane) {
        this.plane = plane;
        this.propellerGroup = null;
        
        // Set default physics parameters
        this.speed = 0;
        this.maxSpeed = 0.5;
        this.minSpeed = 0.05;
        this.acceleration = 0.01;
        this.deceleration = 0.005;
        
        // Rotation parameters
        this.pitchRate = 0.03;
        this.yawRate = 0.02;
        this.rollRate = 0.04;
        this.autoLevelRate = 0.02;
        this.bankAngle = 0; // Current bank angle
        
        // Quaternion for smooth rotation
        this.targetQuaternion = new THREE.Quaternion();
        this.currentQuaternion = new THREE.Quaternion();
        
        // Input state
        this.keyState = {
            w: false, // Pitch down (inverted)
            s: false, // Pitch up (inverted)
            a: false, // Turn right (inverted)
            d: false, // Turn left (inverted)
            q: false, // Speed up
            e: false, // Speed down
            c: false  // Camera toggle
        };
        
        // Initialize controls
        this.setupKeyboardControls();
    }
    
    // Setup keyboard event listeners
    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            if (this.keyState.hasOwnProperty(key)) {
                this.keyState[key] = true;
                event.preventDefault(); // Prevent default browser behaviors
            }
        });
        
        document.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();
            if (this.keyState.hasOwnProperty(key)) {
                this.keyState[key] = false;
                event.preventDefault(); // Prevent default browser behaviors
            }
        });
    }
    
    // Get current speed as percentage of max speed (0-100)
    getSpeedPercentage() {
        return Math.floor((this.speed / this.maxSpeed) * 100);
    }
    
    // Calculate quaternion for bank angle (roll + yaw for realistic turning)
    calculateBankQuaternion() {
        // Create quaternions for each rotation component
        const pitchQuat = new THREE.Quaternion();
        const yawQuat = new THREE.Quaternion();
        const rollQuat = new THREE.Quaternion();
        
        // Calculate pitch based on W/S keys (inverted controls)
        if (this.keyState.w) {
            pitchQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitchRate); // Inverted: pressing W pitches down
        } else if (this.keyState.s) {
            pitchQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -this.pitchRate); // Inverted: pressing S pitches up
        }
        
        // Calculate bank angle (roll + yaw) based on A/D keys for realistic turning (inverted controls)
        if (this.keyState.a) {
            // Inverted left turn (now right) - combine roll and yaw
            rollQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -this.rollRate);
            yawQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yawRate);
            this.bankAngle = Math.max(this.bankAngle - 0.05, -Math.PI / 4); // Max bank 45 degrees
        } else if (this.keyState.d) {
            // Inverted right turn (now left) - combine roll and yaw
            rollQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), this.rollRate);
            yawQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -this.yawRate);
            this.bankAngle = Math.min(this.bankAngle + 0.05, Math.PI / 4); // Max bank 45 degrees
        } else {
            // Auto-level when no turn keys are pressed
            if (Math.abs(this.bankAngle) > 0.01) {
                const levelingForce = -Math.sign(this.bankAngle) * this.autoLevelRate;
                this.bankAngle += levelingForce;
                
                // Apply auto-leveling roll
                rollQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), levelingForce);
            } else {
                this.bankAngle = 0;
            }
        }
        
        // Combine all rotations in the correct order
        const newQuaternion = new THREE.Quaternion();
        newQuaternion.copy(this.currentQuaternion);
        newQuaternion.multiply(pitchQuat);
        newQuaternion.multiply(yawQuat);
        newQuaternion.multiply(rollQuat);
        
        return newQuaternion;
    }
    
    // Update speed based on Q/E keys
    updateSpeed(deltaTime) {
        const scaledDelta = deltaTime * 60; // Scale for consistent behavior across different frame rates
        
        // Increase speed with Q
        if (this.keyState.q) {
            this.speed = Math.min(this.speed + this.acceleration * scaledDelta, this.maxSpeed);
            console.log('Speed up:', this.speed);
        }
        
        // Decrease speed with E
        if (this.keyState.e) {
            this.speed = Math.max(this.speed - this.deceleration * scaledDelta, this.minSpeed);
            console.log('Speed down:', this.speed);
        }
        
        // Constant minimum speed if no thrust control is applied
        if (!this.keyState.q && !this.keyState.e) {
            if (this.speed > this.minSpeed) {
                this.speed = Math.max(this.speed - this.deceleration * 0.5 * scaledDelta, this.minSpeed);
            } else {
                this.speed = this.minSpeed;
            }
        }
        
        // Propeller speed is proportional to the plane's speed
        if (this.propellerGroup) {
            this.propellerGroup.rotation.z += 0.2 + (this.speed / this.maxSpeed) * 0.8;
        }
    }
    
    // Update plane position based on its orientation and speed
    updatePosition(deltaTime) {
        const scaledDelta = deltaTime * 60; // Scale for consistent behavior
        
        // Extract the local forward direction (Z-axis in Three.js)
        const forwardDirection = new THREE.Vector3(0, 0, 1);
        forwardDirection.applyQuaternion(this.plane.quaternion);
        forwardDirection.normalize();
        
        // Move the plane forward based on its speed
        this.plane.position.add(
            forwardDirection.multiplyScalar(this.speed * scaledDelta)
        );
    }
    
    // Update plane movement and rotation
    update(deltaTime) {
        // Ensure deltaTime is not too large (can happen when tab is inactive)
        const clampedDelta = Math.min(deltaTime, 0.1);
        
        // Update plane rotation
        this.targetQuaternion = this.calculateBankQuaternion();
        
        // Smooth interpolation for rotation
        this.plane.quaternion.slerp(this.targetQuaternion, 0.1 * clampedDelta * 60);
        this.currentQuaternion.copy(this.plane.quaternion);
        
        // Update speed and position
        this.updateSpeed(clampedDelta);
        this.updatePosition(clampedDelta);
    }
    
    // Set the propeller group reference
    setProps(props) {
        this.propellerGroup = props.propellerGroup;
    }
} 