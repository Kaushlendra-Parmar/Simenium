/**
 * Model Fallback System for Simenium
 * Provides graceful degradation when models fail to load
 */

window.SimeniumModelFallback = {
    // Create a simple fallback 3D object
    createFallbackModel: function(modelName) {
        const group = new THREE.Group();
        group.name = `fallback-${modelName}`;
        
        // Create a simple box as placeholder
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x666666,
            transparent: true,
            opacity: 0.5
        });
        const cube = new THREE.Mesh(geometry, material);
        
        // Add wireframe overlay
        const edges = new THREE.EdgesGeometry(geometry);
        const wireframe = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
        
        group.add(cube);
        group.add(wireframe);
        
        // Add text label if possible
        this.addTextLabel(group, `Model: ${modelName}\n(Fallback Mode)`);
        
        return group;
    },
    
    // Add text label to fallback model
    addTextLabel: function(group, text) {
        try {
            // Create canvas for text
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 512;
            canvas.height = 256;
            
            // Style text
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#333333';
            context.font = '24px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            
            // Draw text
            const lines = text.split('\n');
            lines.forEach((line, index) => {
                context.fillText(line, canvas.width / 2, (canvas.height / 2) + (index * 30));
            });
            
            // Create texture and material
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.MeshBasicMaterial({ 
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
            });
            
            // Create plane for text
            const geometry = new THREE.PlaneGeometry(4, 2);
            const textMesh = new THREE.Mesh(geometry, material);
            textMesh.position.y = 3;
            
            group.add(textMesh);
        } catch (error) {
            console.warn('Could not create text label for fallback model:', error);
        }
    },
    
    // Handle model loading failure
    handleModelLoadFailure: function(modelName, scene, loadedModels) {
        console.warn(`🔄 Creating fallback for failed model: ${modelName}`);
        
        // Remove any partially loaded models
        loadedModels.forEach(model => scene.remove(model));
        loadedModels.length = 0;
        
        // Create and add fallback model
        const fallbackModel = this.createFallbackModel(modelName);
        scene.add(fallbackModel);
        loadedModels.push(fallbackModel);
        
        // Show user notification
        this.showFallbackNotification(modelName);
        
        return fallbackModel;
    },
    
    // Show notification to user about fallback
    showFallbackNotification: function(modelName) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #ff9800;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            max-width: 300px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-family: 'DM Sans', sans-serif;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">⚠️ Model Loading Issue</div>
            <div style="font-size: 14px; margin-bottom: 10px;">
                Could not load "${modelName}". Showing placeholder instead.
            </div>
            <button onclick="this.parentElement.remove()" style="
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            ">Close</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    },
    
    // Check if WebGL is supported
    checkWebGLSupport: function() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        } catch (error) {
            return false;
        }
    },
    
    // Create WebGL not supported message
    showWebGLNotSupported: function() {
        const container = document.getElementById('canvas')?.parentElement || document.body;
        const message = document.createElement('div');
        message.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            padding: 40px;
            background: #f8f9fa;
            border-radius: 12px;
            border: 2px solid #e9ecef;
            max-width: 400px;
            font-family: 'DM Sans', sans-serif;
        `;
        
        message.innerHTML = `
            <h3 style="color: #dc3545; margin-bottom: 15px;">🚫 WebGL Not Supported</h3>
            <p style="margin-bottom: 15px; color: #6c757d;">
                Your browser does not support WebGL, which is required for 3D model viewing.
            </p>
            <p style="margin-bottom: 20px; color: #6c757d;">
                Please try using a modern browser like Chrome, Firefox, Safari, or Edge.
            </p>
            <button onclick="location.reload()" style="
                background: #007bff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-family: inherit;
            ">Retry</button>
        `;
        
        container.appendChild(message);
    }
};

// Add CSS animation for notifications
if (!document.getElementById('fallback-styles')) {
    const style = document.createElement('style');
    style.id = 'fallback-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

console.log('🔄 Model Fallback System loaded');
