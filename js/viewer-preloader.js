/**
 * Model Viewer Preloader Integration
 * This script helps model viewers load their specific models immediately
 * while respecting the background preloading system
 */

class ViewerPreloader {
    constructor() {
        this.smartPreloader = null;
        this.currentModelId = null;
        this.loadingStartTime = null;
        
        this.init();
    }

    async init() {
        // Wait for smart preloader to be available
        await this.waitForSmartPreloader();
        
        // Detect current model from URL or page context
        this.detectCurrentModel();
        
        // Load current model immediately
        if (this.currentModelId) {
            await this.loadCurrentModel();
        }
    }

    async waitForSmartPreloader() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds maximum wait
            
            const checkPreloader = () => {
                attempts++;
                if (window.SmartPreloader) {
                    this.smartPreloader = window.SmartPreloader;
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.warn('[ViewerPreloader] Smart preloader not available after 5 seconds');
                    resolve(); // Continue without smart preloader
                } else {
                    setTimeout(checkPreloader, 100);
                }
            };
            checkPreloader();
        });
    }

    detectCurrentModel() {
        const currentPath = window.location.pathname;
        
        // Map folder names to model IDs
        const folderToModelMap = {
            'induction motor': 'induction-motor-rotor', // Primary model
            'Insulators': 'insulator-pin', // Primary model  
            'transformer': 'transformer',
            'dc motor': 'dc-motor',
            'galvanometer': 'galvanometer',
            'multimeter': 'multimeter',
            'atom': 'atom',
            'cells': 'cells-human', // Primary model
            'dna & rna': 'dna', // Primary model
            'digestive system': 'digestive-system',
            'neuron': 'neuron',
            'solar system': 'solar-system',
            'water cycle': 'water-cycle'
        };

        // Extract folder name from path
        for (const [folder, modelId] of Object.entries(folderToModelMap)) {
            if (currentPath.includes(folder)) {
                this.currentModelId = modelId;
                console.log('[ViewerPreloader] Detected current model:', modelId);
                break;
            }
        }

        if (!this.currentModelId) {
            console.warn('[ViewerPreloader] Could not detect current model from path:', currentPath);
        }
    }

    async loadCurrentModel() {
        if (!this.smartPreloader || !this.currentModelId) {
            return false;
        }

        console.log('[ViewerPreloader] Ensuring current model is loaded:', this.currentModelId);
        this.loadingStartTime = performance.now();

        try {
            // Check if already loaded
            if (this.smartPreloader.isModelLoaded(this.currentModelId)) {
                console.log('[ViewerPreloader] Model already cached:', this.currentModelId);
                this.onModelReady();
                return true;
            }

            // Load the model immediately
            const success = await this.smartPreloader.loadCurrentModel(this.currentModelId);
            
            if (success) {
                this.onModelReady();
                return true;
            } else {
                console.warn('[ViewerPreloader] Failed to load model:', this.currentModelId);
                return false;
            }

        } catch (error) {
            console.error('[ViewerPreloader] Error loading current model:', error);
            return false;
        }
    }

    onModelReady() {
        const loadTime = this.loadingStartTime ? 
            (performance.now() - this.loadingStartTime).toFixed(2) : 'unknown';
        
        console.log(`[ViewerPreloader] Model ready: ${this.currentModelId} (${loadTime}ms)`);
        
        // Dispatch custom event for the viewer to handle
        window.dispatchEvent(new CustomEvent('modelPreloaded', {
            detail: {
                modelId: this.currentModelId,
                loadTime: loadTime
            }
        }));
    }

    // Public API
    getCurrentModelId() {
        return this.currentModelId;
    }

    isCurrentModelLoaded() {
        return this.smartPreloader?.isModelLoaded(this.currentModelId) || false;
    }

    // Load complementary models for the current viewer
    async loadComplementaryModels() {
        if (!this.smartPreloader || !this.currentModelId) {
            return;
        }

        const complementaryModels = this.getComplementaryModels(this.currentModelId);
        
        for (const modelId of complementaryModels) {
            console.log('[ViewerPreloader] Loading complementary model:', modelId);
            this.smartPreloader.forcePreloadModel(modelId);
        }
    }

    getComplementaryModels(primaryModelId) {
        const complementaryMap = {
            'induction-motor-rotor': ['induction-motor-stator'],
            'induction-motor-stator': ['induction-motor-rotor'], 
            'insulator-pin': ['insulator-suspension'],
            'insulator-suspension': ['insulator-pin'],
            'cells-human': ['cells-plant', 'cells-animal'],
            'cells-plant': ['cells-human', 'cells-animal'],
            'cells-animal': ['cells-human', 'cells-plant'],
            'dna': ['rna'],
            'rna': ['dna']
        };

        return complementaryMap[primaryModelId] || [];
    }
}

// Initialize viewer preloader
let viewerPreloader;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        viewerPreloader = new ViewerPreloader();
    });
} else {
    viewerPreloader = new ViewerPreloader();
}

// Expose to global scope
window.ViewerPreloader = viewerPreloader;
