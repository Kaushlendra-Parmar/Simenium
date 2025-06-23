/**
 * Memory Management for Simenium
 * Prevents memory leaks in Three.js applications
 */

window.SimeniumMemoryManager = {
    // Track disposable objects
    disposableObjects: new Set(),
    
    // Register object for disposal
    register: function(object) {
        this.disposableObjects.add(object);
    },
    
    // Properly dispose of Three.js objects
    disposeObject: function(object) {
        if (!object) return;
        
        // Dispose geometry
        if (object.geometry) {
            object.geometry.dispose();
        }
        
        // Dispose materials
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => this.disposeMaterial(material));
            } else {
                this.disposeMaterial(object.material);
            }
        }
        
        // Dispose children recursively
        if (object.children) {
            object.children.slice().forEach(child => {
                this.disposeObject(child);
                object.remove(child);
            });
        }
        
        // Remove from tracking
        this.disposableObjects.delete(object);
    },
    
    // Dispose material and its textures
    disposeMaterial: function(material) {
        if (!material) return;
        
        // Dispose all textures
        const textureProperties = [
            'map', 'normalMap', 'bumpMap', 'emissiveMap', 
            'specularMap', 'envMap', 'lightMap', 'aoMap',
            'roughnessMap', 'metalnessMap', 'alphaMap',
            'displacementMap'
        ];
        
        textureProperties.forEach(prop => {
            if (material[prop] && material[prop].dispose) {
                material[prop].dispose();
            }
        });
        
        // Dispose material
        if (material.dispose) {
            material.dispose();
        }
    },
    
    // Clean up scene
    cleanupScene: function(scene) {
        if (!scene) return;
        
        const objectsToRemove = [];
        scene.traverse(object => {
            objectsToRemove.push(object);
        });
        
        objectsToRemove.forEach(object => {
            this.disposeObject(object);
            if (object.parent) {
                object.parent.remove(object);
            }
        });
    },
    
    // Clean up renderer
    cleanupRenderer: function(renderer) {
        if (!renderer) return;
        
        if (renderer.dispose) {
            renderer.dispose();
        }
        
        // Force garbage collection of WebGL context
        if (renderer.forceContextLoss) {
            renderer.forceContextLoss();
        }
    },
    
    // Monitor memory usage
    monitorMemory: function() {
        if (!performance.memory) return null;
        
        const memory = {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        };
        
        // Warn if memory usage is high
        if (memory.used > memory.limit * 0.8) {
            console.warn('🚨 High memory usage detected:', memory);
            this.suggestCleanup();
        }
        
        return memory;
    },
    
    // Suggest cleanup actions
    suggestCleanup: function() {
        console.log('💡 Consider cleaning up unused models to free memory');
        
        // Auto-cleanup if too many objects are tracked
        if (this.disposableObjects.size > 50) {
            console.log('🧹 Auto-cleaning up old objects...');
            const objectsArray = Array.from(this.disposableObjects);
            const oldObjects = objectsArray.slice(0, Math.floor(objectsArray.length / 2));
            oldObjects.forEach(obj => this.disposeObject(obj));
        }
    },
    
    // Emergency cleanup
    emergencyCleanup: function() {
        console.warn('🚨 Emergency memory cleanup initiated');
        
        // Dispose all tracked objects
        this.disposableObjects.forEach(obj => this.disposeObject(obj));
        this.disposableObjects.clear();
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    },
    
    // Setup automatic cleanup on page unload
    setupAutoCleanup: function() {
        window.addEventListener('beforeunload', () => {
            this.emergencyCleanup();
        });
        
        // Cleanup on visibility change (tab switch)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.monitorMemory();
            }
        });
    }
};

// Initialize auto cleanup
SimeniumMemoryManager.setupAutoCleanup();

// Monitor memory every 30 seconds
setInterval(() => {
    SimeniumMemoryManager.monitorMemory();
}, 30000);

console.log('🧹 Memory Manager initialized');
