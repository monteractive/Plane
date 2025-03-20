export class GameUI {
    constructor(planeControls, cameraInfo = null) {
        this.planeControls = planeControls;
        this.cameraInfo = cameraInfo;
        this.uiContainer = null;
        this.speedIndicator = null;
        this.speedBar = null;
        this.keyStateIndicators = {};
        this.cameraModeIndicator = null;
        
        this.createUI();
    }
    
    createUI() {
        // Create the main UI container
        this.uiContainer = document.createElement('div');
        this.uiContainer.style.position = 'fixed';
        this.uiContainer.style.bottom = '20px';
        this.uiContainer.style.left = '20px';
        this.uiContainer.style.padding = '15px';
        this.uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        this.uiContainer.style.borderRadius = '5px';
        this.uiContainer.style.color = 'white';
        this.uiContainer.style.fontFamily = 'Arial, sans-serif';
        this.uiContainer.style.zIndex = '1000';
        this.uiContainer.style.userSelect = 'none';
        
        // Add controls instruction container
        const controlsContainer = document.createElement('div');
        controlsContainer.style.marginBottom = '15px';
        
        // Add controls title
        const controlsTitle = document.createElement('div');
        controlsTitle.textContent = 'CONTROLS (INVERTED)';
        controlsTitle.style.fontSize = '14px';
        controlsTitle.style.fontWeight = 'bold';
        controlsTitle.style.marginBottom = '5px';
        controlsContainer.appendChild(controlsTitle);
        
        // Add controls list
        const controls = [
            { key: 'W/S', action: 'Pitch down/up' },
            { key: 'A/D', action: 'Turn right/left' },
            { key: 'Q/E', action: 'Speed up/down' },
            { key: 'C', action: 'Toggle camera' }
        ];
        
        // Create controls list
        for (const control of controls) {
            const controlItem = document.createElement('div');
            controlItem.style.display = 'flex';
            controlItem.style.marginBottom = '3px';
            controlItem.style.fontSize = '12px';
            
            const keySpan = document.createElement('span');
            keySpan.textContent = control.key;
            keySpan.style.fontWeight = 'bold';
            keySpan.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            keySpan.style.padding = '2px 5px';
            keySpan.style.borderRadius = '3px';
            keySpan.style.marginRight = '8px';
            keySpan.style.width = '30px';
            keySpan.style.textAlign = 'center';
            
            const actionSpan = document.createElement('span');
            actionSpan.textContent = control.action;
            
            controlItem.appendChild(keySpan);
            controlItem.appendChild(actionSpan);
            controlsContainer.appendChild(controlItem);
        }
        
        this.uiContainer.appendChild(controlsContainer);
        
        // Add camera mode indicator
        if (this.cameraInfo) {
            const cameraModeContainer = document.createElement('div');
            cameraModeContainer.style.marginBottom = '15px';
            
            const cameraModeTitle = document.createElement('div');
            cameraModeTitle.textContent = 'CAMERA';
            cameraModeTitle.style.fontSize = '14px';
            cameraModeTitle.style.fontWeight = 'bold';
            cameraModeTitle.style.marginBottom = '5px';
            cameraModeContainer.appendChild(cameraModeTitle);
            
            this.cameraModeIndicator = document.createElement('div');
            this.cameraModeIndicator.style.fontSize = '12px';
            this.cameraModeIndicator.textContent = 'FOLLOW MODE';
            cameraModeContainer.appendChild(this.cameraModeIndicator);
            
            this.uiContainer.appendChild(cameraModeContainer);
        }
        
        // Add key state indicators
        const keyStateContainer = document.createElement('div');
        keyStateContainer.style.marginBottom = '15px';
        
        const keyStateTitle = document.createElement('div');
        keyStateTitle.textContent = 'KEY STATES';
        keyStateTitle.style.fontSize = '14px';
        keyStateTitle.style.fontWeight = 'bold';
        keyStateTitle.style.marginBottom = '5px';
        keyStateContainer.appendChild(keyStateTitle);
        
        // Create indicators for each key
        const keys = ['W', 'A', 'S', 'D', 'Q', 'E', 'C'];
        for (const key of keys) {
            const keyItem = document.createElement('span');
            keyItem.textContent = key;
            keyItem.style.display = 'inline-block';
            keyItem.style.margin = '0 4px';
            keyItem.style.padding = '3px 6px';
            keyItem.style.backgroundColor = 'rgba(255, 0, 0, 0.2)'; // Inactive color
            keyItem.style.borderRadius = '3px';
            keyItem.style.fontWeight = 'bold';
            keyItem.style.fontSize = '12px';
            keyStateContainer.appendChild(keyItem);
            
            this.keyStateIndicators[key.toLowerCase()] = keyItem;
        }
        
        this.uiContainer.appendChild(keyStateContainer);
        
        // Add speed indicator
        const speedContainer = document.createElement('div');
        
        // Add speed title
        const speedTitle = document.createElement('div');
        speedTitle.textContent = 'SPEED';
        speedTitle.style.fontSize = '14px';
        speedTitle.style.fontWeight = 'bold';
        speedTitle.style.marginBottom = '5px';
        speedContainer.appendChild(speedTitle);
        
        // Create speed bar container
        const speedBarContainer = document.createElement('div');
        speedBarContainer.style.width = '100%';
        speedBarContainer.style.height = '15px';
        speedBarContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        speedBarContainer.style.borderRadius = '3px';
        speedBarContainer.style.overflow = 'hidden';
        speedBarContainer.style.position = 'relative';
        speedBarContainer.style.marginBottom = '5px';
        
        // Create speed bar
        this.speedBar = document.createElement('div');
        this.speedBar.style.height = '100%';
        this.speedBar.style.width = '0%';
        this.speedBar.style.backgroundColor = '#4CAF50';
        this.speedBar.style.position = 'absolute';
        this.speedBar.style.transition = 'width 0.3s ease-out';
        speedBarContainer.appendChild(this.speedBar);
        
        // Create speed text
        this.speedIndicator = document.createElement('div');
        this.speedIndicator.style.fontSize = '12px';
        this.speedIndicator.style.textAlign = 'right';
        
        speedContainer.appendChild(speedBarContainer);
        speedContainer.appendChild(this.speedIndicator);
        this.uiContainer.appendChild(speedContainer);
        
        // Add UI to document
        document.body.appendChild(this.uiContainer);
    }
    
    // Update camera mode display
    updateCameraMode(mode) {
        if (this.cameraModeIndicator) {
            this.cameraModeIndicator.textContent = mode === 'follow' ? 'FOLLOW MODE' : 'EXTERNAL VIEW';
        }
    }
    
    update() {
        // Update speed indicator
        const speedPercentage = this.planeControls.getSpeedPercentage();
        this.speedIndicator.textContent = `${speedPercentage}% (${this.planeControls.speed.toFixed(3)})`;
        this.speedBar.style.width = `${speedPercentage}%`;
        
        // Update speed bar color based on speed
        if (speedPercentage < 30) {
            this.speedBar.style.backgroundColor = '#4CAF50'; // Green
        } else if (speedPercentage < 70) {
            this.speedBar.style.backgroundColor = '#FFC107'; // Yellow
        } else {
            this.speedBar.style.backgroundColor = '#F44336'; // Red
        }
        
        // Update key state indicators
        for (const key in this.planeControls.keyState) {
            const indicator = this.keyStateIndicators[key];
            if (indicator) {
                if (this.planeControls.keyState[key]) {
                    indicator.style.backgroundColor = 'rgba(0, 255, 0, 0.5)'; // Active
                } else {
                    indicator.style.backgroundColor = 'rgba(255, 0, 0, 0.2)'; // Inactive
                }
            }
        }
        
        // Update camera mode if info is provided
        if (this.cameraInfo && this.cameraModeIndicator) {
            this.updateCameraMode(this.cameraInfo.mode);
        }
    }
} 