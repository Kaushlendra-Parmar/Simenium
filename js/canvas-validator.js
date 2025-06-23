/**
 * Canvas Validation and Safety Checks for Simenium
 * Ensures canvas elements exist before initializing Three.js
 */

window.SimeniumCanvasValidator = {
    // Validate canvas element exists and is ready
    validateCanvas: function(canvasId = 'canvas') {
        const canvas = document.getElementById(canvasId);
        
        if (!canvas) {
            console.error(`❌ Canvas element '${canvasId}' not found`);
            this.showCanvasError('Canvas element not found');
            return null;
        }
        
        // Check if canvas is in DOM
        if (!document.body.contains(canvas)) {
            console.error(`❌ Canvas element '${canvasId}' not attached to DOM`);
            this.showCanvasError('Canvas element not properly attached');
            return null;
        }
        
        // Check canvas dimensions
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            console.warn(`⚠️ Canvas element '${canvasId}' has zero dimensions`);
            // Set minimum dimensions
            canvas.style.width = '100vw';
            canvas.style.height = '100vh';
        }
        
        console.log(`✅ Canvas element '${canvasId}' validated successfully`);
        return canvas;
    },
    
    // Show canvas error message
    showCanvasError: function(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #dc3545;
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            font-family: 'DM Sans', sans-serif;
            max-width: 400px;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        
        errorDiv.innerHTML = `
            <h3 style="margin: 0 0 15px 0; font-size: 18px;">🚫 Canvas Error</h3>
            <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.4;">
                ${message}. The 3D viewer cannot be initialized.
            </p>
            <button onclick="location.reload()" style="
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                margin-right: 10px;
            ">Reload Page</button>
            <button onclick="history.back()" style="
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            ">Go Back</button>
        `;
        
        document.body.appendChild(errorDiv);
    },
    
    // Wait for DOM to be ready
    waitForDOM: function(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    },
    
    // Safe Three.js renderer initialization
    createSafeRenderer: function(canvasId = 'canvas', options = {}) {
        const canvas = this.validateCanvas(canvasId);
        if (!canvas) {
            return null;
        }
        
        try {
            const defaultOptions = {
                canvas: canvas,
                antialias: true,
                alpha: false,
                powerPreference: "high-performance"
            };
            
            const rendererOptions = { ...defaultOptions, ...options };
            const renderer = new THREE.WebGLRenderer(rendererOptions);
            
            // Set safe initial size
            const rect = canvas.getBoundingClientRect();
            const width = rect.width || window.innerWidth;
            const height = rect.height || window.innerHeight;
            
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
            
            return renderer;
        } catch (error) {
            console.error('Failed to create WebGL renderer:', error);
            
            // Check for WebGL support
            if (!window.SimeniumModelFallback?.checkWebGLSupport()) {
                window.SimeniumModelFallback?.showWebGLNotSupported();
            } else {
                this.showCanvasError('Failed to initialize 3D graphics');
            }
            
            return null;
        }
    },
    
    // Safe animation frame handler
    createSafeAnimationLoop: function(animateFunction) {
        let animationId;
        let isRunning = false;
        
        const safeAnimate = () => {
            if (!isRunning) return;
            
            try {
                animateFunction();
            } catch (error) {
                console.error('Animation frame error:', error);
                if (window.SimeniumErrorHandler) {
                    window.SimeniumErrorHandler.logError(error, 'Animation Loop');
                }
                // Continue animation despite error
            }
            
            animationId = requestAnimationFrame(safeAnimate);
        };
        
        return {
            start: () => {
                if (!isRunning) {
                    isRunning = true;
                    safeAnimate();
                }
            },
            stop: () => {
                isRunning = false;
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
            }
        };
    }
};

console.log('🛡️ Canvas Validator loaded');
