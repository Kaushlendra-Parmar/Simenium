/**
 * Smart 3D Model Preloader for Simenium
 * Handles intelligent background preloading with network detection and user interaction prioritization
 */

class SmartModelPreloader {
    constructor() {
        this.isPreloading = false;
        this.preloadQueue = [];
        this.priorityQueue = [];
        this.loadedModels = new Set();
        this.serviceWorker = null;
        this.networkSpeed = 'unknown';
        this.shouldPreload = false;
        this.userNavigatedAway = false;
        this.isOnHomepage = true; // Track if we're on homepage
        this.currentPage = window.location.pathname; // Track current page
        
        // Model configurations with priority and file sizes (estimated)
        // Priority order matches homepage cards + their complementary models
        this.modelConfigs = {
            'induction-motor-rotor': { 
                path: 'induction motor/models/rotar.glb', 
                priority: 1, 
                estimatedSize: 4.5,  // MB
                category: 'electrical'
            },
            'induction-motor-stator': { 
                path: 'induction motor/models/stator.glb', 
                priority: 2,  // Complement to rotor - high priority
                estimatedSize: 5.1,
                category: 'electrical'
            },
            'insulator-pin': { 
                path: 'Insulators/models/Pin Insulator.glb', 
                priority: 3, 
                estimatedSize: 2.3,
                category: 'electrical'
            },
            'insulator-suspension': { 
                path: 'Insulators/models/Suspension Insulator.glb', 
                priority: 4,  // Complement to pin insulator
                estimatedSize: 3.4,
                category: 'electrical'
            },
            'transformer': { 
                path: 'transformer/models/high_voltage_power_transformer.glb', 
                priority: 5, 
                estimatedSize: 7.9,
                category: 'electrical'
            },
            'dc-motor': { 
                path: 'dc motor/models/model_of_dc_motor_working_principle.glb', 
                priority: 6, 
                estimatedSize: 9.1,
                category: 'electrical'
            },
            'galvanometer': { 
                path: 'galvanometer/models/moving_coil_galvanometer.glb', 
                priority: 7, 
                estimatedSize: 3.7,
                category: 'electrical'
            },
            'multimeter': { 
                path: 'multimeter/models/multimeter.glb', 
                priority: 8, 
                estimatedSize: 6.8,
                category: 'electrical'
            },
            'atom': { 
                path: 'atom/models/atom.glb', 
                priority: 9, 
                estimatedSize: 2.5,
                category: 'science'
            },
            'cells-human': { 
                path: 'cells/models/human_cell.glb', 
                priority: 10, 
                estimatedSize: 5.3,
                category: 'biology'
            },
            'cells-plant': { 
                path: 'cells/models/plant_cell_organelles.glb', 
                priority: 11,  // Plant cell complement to human cell
                estimatedSize: 4.8,
                category: 'biology'
            },
            'cells-animal': { 
                path: 'cells/models/animal_cell_-_downloadable.glb', 
                priority: 12,  // Animal cell complement to human/plant cells
                estimatedSize: 4.2,
                category: 'biology'
            },
            'dna': { 
                path: 'dna & rna/models/dna.glb', 
                priority: 13, 
                estimatedSize: 3.1,
                category: 'biology'
            },
            'rna': { 
                path: 'dna & rna/models/rna.glb', 
                priority: 14,  // RNA complement to DNA - high priority
                estimatedSize: 2.8,
                category: 'biology'
            },
            'digestive-system': { 
                path: 'digestive system/models/digestive_organs.glb', 
                priority: 15, 
                estimatedSize: 12.3,
                category: 'biology'
            },
            'neuron': { 
                path: 'neuron/models/neuron.glb', 
                priority: 16, 
                estimatedSize: 6.4,
                category: 'biology'
            },
            'solar-system': { 
                path: 'solar system/models/solar_system.glb', 
                priority: 17, 
                estimatedSize: 15.2,
                category: 'science'
            },
            'water-cycle': { 
                path: 'water cycle/models/water_cycle.glb', 
                priority: 18, 
                estimatedSize: 8.7,
                category: 'environmental'
            },
            'atom': { 
                path: 'atom/models/atom.glb', 
                priority: 19, 
                estimatedSize: 3.2,
                category: 'chemistry'
            },
            // Additional induction motor components
            'induction-motor-torus1': { 
                path: 'induction motor/models/torus1.glb', 
                priority: 20, 
                estimatedSize: 2.1,
                category: 'electrical'
            },
            'induction-motor-torus2': { 
                path: 'induction motor/models/torus2.glb', 
                priority: 21, 
                estimatedSize: 2.1,
                category: 'electrical'
            },
            'induction-motor-torus3': { 
                path: 'induction motor/models/torus3.glb', 
                priority: 22, 
                estimatedSize: 2.1,
                category: 'electrical'
            }
        };
        
        this.init();
    }

    async init() {
        try {
            // Skip preloader initialization entirely on model viewer pages for maximum performance
            const currentPath = window.location.pathname;
            const isModelViewer = currentPath.includes('/atom/') || currentPath.includes('/cells/') ||
                                currentPath.includes('/water cycle/') || currentPath.includes('/solar system/') ||
                                currentPath.includes('/transformer/') || currentPath.includes('/dc motor/') ||
                                currentPath.includes('/neuron/') || currentPath.includes('/multimeter/') ||
                                currentPath.includes('/galvanometer/') || currentPath.includes('/digestive system/') ||
                                currentPath.includes('/dna & rna/') || currentPath.includes('/Insulators/') ||
                                currentPath.includes('/induction motor/');
            
            if (isModelViewer) {
                console.log('[Preloader] Model viewer detected - skipping preloader for maximum performance');
                this.shouldPreload = false;
                return;
            }
            
            console.log('[Preloader] Initializing Smart Model Preloader...');
            
            // Register service worker
            await this.registerServiceWorker();
            
            // Set up navigation detection
            this.setupNavigationDetection();
            
            // Set up hover priority system
            this.setupHoverPriority();
            
            // Wait for homepage to be fully loaded
            if (document.readyState !== 'complete') {
                window.addEventListener('load', () => this.startPreloading());
            } else {
                this.startPreloading();
            }
            
        } catch (error) {
            console.error('[Preloader] Initialization failed:', error);
            // Continue without preloading if init fails
            this.shouldPreload = false;
        }
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                // Dynamic service worker path based on environment
                let swPath = './sw.js'; // Default for homepage
                
                const currentPath = window.location.pathname;
                if (currentPath.includes('/') && !currentPath.endsWith('/') && !currentPath.endsWith('index.html')) {
                    // We're in a subdirectory
                    swPath = '../sw.js';
                }
                
                const registration = await navigator.serviceWorker.register(swPath);
                console.log('[Preloader] Service Worker registered:', registration);
                
                // Wait for service worker to be ready
                await navigator.serviceWorker.ready;
                this.serviceWorker = navigator.serviceWorker;
                
                // Listen for messages from service worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    this.handleServiceWorkerMessage(event.data);
                });
                
            } catch (error) {
                console.error('[Preloader] Service Worker registration failed:', error);
                // Don't break the app if SW fails - continue without caching
                this.shouldPreload = false;
            }
        } else {
            console.warn('[Preloader] Service Worker not supported in this browser');
            this.shouldPreload = false;
        }
    }

    async startPreloading() {
        console.log('[Preloader] Starting smart preloading system...');
        
        // Check network conditions
        await this.detectNetworkSpeed();
        
        if (!this.shouldPreload) {
            console.log('[Preloader] Preloading disabled due to network conditions');
            return;
        }
        
        // Build preload queue based on priority
        this.buildPreloadQueue();
        
        // Start preloading
        this.isPreloading = true;
        this.processPreloadQueue();
    }

    async detectNetworkSpeed() {
        this.shouldPreload = true; // Default to true
        
        // Check if user has data saver enabled
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            // Don't preload on slow connections
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                this.shouldPreload = false;
                this.networkSpeed = 'slow';
                return;
            }
            
            // Don't preload if user has data saver enabled
            if (connection.saveData === true) {
                this.shouldPreload = false;
                console.log('[Preloader] Data saver enabled, skipping preload');
                return;
            }
            
            this.networkSpeed = connection.effectiveType || 'unknown';
            console.log('[Preloader] Network speed detected:', this.networkSpeed);
        }
        
        // Additional speed test using a small resource
        try {
            const startTime = performance.now();
            await fetch('./thumbnail.png?' + Math.random(), { cache: 'no-cache' });
            const loadTime = performance.now() - startTime;
            
            // If loading a small image takes more than 2 seconds, consider it slow
            if (loadTime > 2000) {
                this.shouldPreload = false;
                this.networkSpeed = 'slow';
                console.log('[Preloader] Slow network detected via speed test');
            }
        } catch (error) {
            console.warn('[Preloader] Network speed test failed:', error);
        }
    }

    buildPreloadQueue() {
        // Sort models by priority
        const sortedModels = Object.entries(this.modelConfigs)
            .sort(([,a], [,b]) => a.priority - b.priority);
        
        // For slow networks, only preload the smallest, highest priority models
        if (this.networkSpeed === '3g' || this.networkSpeed === 'slow') {
            this.preloadQueue = sortedModels
                .filter(([,config]) => config.estimatedSize < 5) // Only small models
                .slice(0, 3) // Only first 3
                .map(([key, config]) => ({ key, ...config }));
        } else {
            // For fast networks, load all models
            this.preloadQueue = sortedModels.map(([key, config]) => ({ key, ...config }));
        }
        
        console.log('[Preloader] Preload queue built:', this.preloadQueue.length, 'models');
    }

    setupNavigationDetection() {
        // Detect navigation between pages
        this.detectPageContext();
        
        // For homepage: continue background loading
        // For model viewers: pause background loading but keep service worker active
        window.addEventListener('beforeunload', (event) => {
            // For internal navigation, just pause preloading
            this.isPreloading = false;
            console.log('[Preloader] Navigation detected, pausing preloading');
        });
        
        // Detect page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.isPreloading = false;
                console.log('[Preloader] Page hidden, pausing preloading');
            } else if (!this.userNavigatedAway && this.shouldPreload) {
                // Only resume if we're back on homepage or user hasn't left site
                this.detectPageContext();
                if (this.isOnHomepage) {
                    this.isPreloading = true;
                    this.processPreloadQueue();
                    console.log('[Preloader] Resumed preloading on homepage');
                } else {
                    console.log('[Preloader] On model viewer, keeping preloading paused');
                }
            }
        });
        
        // Listen for hash changes (navigation within single page)
        window.addEventListener('hashchange', () => {
            this.detectPageContext();
        });
        
        // Listen for popstate (back/forward navigation)
        window.addEventListener('popstate', () => {
            // Detect page context immediately for better performance
            this.detectPageContext();
        });
    }

    detectPageContext() {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        
        // Check if we're on homepage (index.html or root path)
        this.isOnHomepage = currentPath.endsWith('index.html') || 
                           currentPath === '/' || 
                           currentPath.endsWith('/') ||
                           currentPath.includes('/Simenium') && !currentPath.includes('/models/') &&
                           !currentPath.includes('/atom/') && !currentPath.includes('/cells/') &&
                           !currentPath.includes('/water cycle/') && !currentPath.includes('/solar system/');
        
        // If we've returned to homepage, resume background loading
        if (this.isOnHomepage && !this.userNavigatedAway && this.shouldPreload && !this.isPreloading) {
            console.log('[Preloader] Returned to homepage, resuming background loading');
            this.isPreloading = true;
            this.processPreloadQueue();
        } else if (!this.isOnHomepage) {
            console.log('[Preloader] On model viewer page, keeping background loading paused');
        }
        
        this.currentPage = currentPath;
    }

    setupHoverPriority() {
        // Find all model cards and add hover listeners
        const modelCards = document.querySelectorAll('[data-model-id]');
        
        modelCards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                const modelId = e.target.closest('[data-model-id]').dataset.modelId;
                this.prioritizeModel(modelId);
            });
        });
        
        // Also listen for clicks to update priority
        modelCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const modelId = e.target.closest('[data-model-id]').dataset.modelId;
                this.prioritizeModel(modelId, true); // High priority for clicks
            });
        });
    }

    prioritizeModel(modelId, highPriority = false) {
        const modelConfig = this.modelConfigs[modelId];
        if (!modelConfig || this.loadedModels.has(modelId)) {
            return;
        }
        
        console.log('[Preloader] Prioritizing model:', modelId);
        
        // Remove from regular queue if present
        this.preloadQueue = this.preloadQueue.filter(item => item.key !== modelId);
        
        // Add to priority queue
        const priorityItem = { key: modelId, ...modelConfig, isPriority: true };
        
        if (highPriority) {
            this.priorityQueue.unshift(priorityItem); // Add to front
        } else {
            this.priorityQueue.push(priorityItem); // Add to end
        }
        
        // Process priority queue immediately if preloading is active
        if (this.isPreloading) {
            this.processPriorityQueue();
        }
    }

    async processPreloadQueue() {
        if (!this.isPreloading || this.userNavigatedAway) {
            return;
        }
        
        // Only continue background loading if on homepage
        if (!this.isOnHomepage) {
            console.log('[Preloader] Not on homepage, background loading paused');
            return;
        }
        
        // Process priority queue first
        await this.processPriorityQueue();
        
        // Then process regular queue
        while (this.preloadQueue.length > 0 && this.isPreloading && !this.userNavigatedAway && this.isOnHomepage) {
            const modelItem = this.preloadQueue.shift();
            await this.preloadModel(modelItem);
            
            // Process model without delay for optimal performance
            await this.preloadModel(modelItem);
        }
        
        console.log('[Preloader] Preloading complete');
    }

    async processPriorityQueue() {
        while (this.priorityQueue.length > 0 && this.isPreloading && !this.userNavigatedAway && this.isOnHomepage) {
            const modelItem = this.priorityQueue.shift();
            await this.preloadModel(modelItem);
        }
    }

    async preloadModel(modelItem) {
        if (this.loadedModels.has(modelItem.key) || !this.serviceWorker) {
            return;
        }
        
        // Allow current model to load even if not on homepage
        const canLoad = this.isOnHomepage || modelItem.isCurrentModel;
        if (!canLoad) {
            console.log('[Preloader] Skipping model load - not on homepage:', modelItem.key);
            return;
        }
        
        console.log('[Preloader] Preloading model:', modelItem.key, `(${modelItem.estimatedSize}MB)`);
        
        try {
            const modelUrl = `/${modelItem.path}`;
            
            // Check if service worker controller is available
            if (!this.serviceWorker.controller) {
                console.warn('[Preloader] No service worker controller available');
                return;
            }
            
            // Send preload request to service worker
            const messageChannel = new MessageChannel();
            
            return new Promise((resolve) => {
                // Set timeout to prevent hanging
                const timeout = setTimeout(() => {
                    console.warn('[Preloader] Preload timeout for:', modelItem.key);
                    resolve();
                }, 10000);
                
                messageChannel.port1.onmessage = (event) => {
                    clearTimeout(timeout);
                    this.handlePreloadResponse(event.data, modelItem.key);
                    resolve();
                };
                
                this.serviceWorker.controller.postMessage({
                    type: 'PRELOAD_MODEL',
                    url: modelUrl
                }, [messageChannel.port2]);
            });
            
        } catch (error) {
            console.error('[Preloader] Failed to preload model:', modelItem.key, error);
        }
    }

    handlePreloadResponse(data, modelKey) {
        if (data.type === 'PRELOAD_COMPLETE') {
            if (data.success) {
                this.loadedModels.add(modelKey);
                console.log('[Preloader] Model preloaded successfully:', modelKey);
            } else {
                console.error('[Preloader] Model preload failed:', modelKey, data.error);
            }
        }
    }

    handleServiceWorkerMessage(data) {
        if (data.type === 'CACHE_STATUS') {
            console.log('[Preloader] Cache status:', data.cachedModels.length, '/', data.totalModels);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API methods
    getPreloadStatus() {
        return {
            isPreloading: this.isPreloading,
            loadedModels: Array.from(this.loadedModels),
            queueLength: this.preloadQueue.length,
            priorityQueueLength: this.priorityQueue.length,
            networkSpeed: this.networkSpeed,
            shouldPreload: this.shouldPreload
        };
    }

    forcePreloadModel(modelId) {
        this.prioritizeModel(modelId, true);
    }

    // Method to ensure current model loads immediately (for model viewers)
    async loadCurrentModel(modelId) {
        if (!modelId || this.loadedModels.has(modelId)) {
            return true; // Already loaded
        }

        const modelConfig = this.modelConfigs[modelId];
        if (!modelConfig) {
            console.warn('[Preloader] Unknown model ID:', modelId);
            return false;
        }

        console.log('[Preloader] Loading current model immediately:', modelId);
        
        // Add to front of priority queue for immediate loading
        this.priorityQueue.unshift({ 
            key: modelId, 
            ...modelConfig, 
            isPriority: true,
            isCurrentModel: true 
        });

        // Process this model immediately regardless of homepage status
        const modelItem = this.priorityQueue.shift();
        await this.preloadModel(modelItem);
        
        return this.loadedModels.has(modelId);
    }

    // Get loading status for a specific model
    isModelLoaded(modelId) {
        return this.loadedModels.has(modelId);
    }
}

// Browser compatibility checks
function checkBrowserCompatibility() {
    const issues = [];
    
    // Check for Service Worker support
    if (!('serviceWorker' in navigator)) {
        issues.push('Service Worker not supported');
    }
    
    // Check for Promise support
    if (typeof Promise === 'undefined') {
        issues.push('Promise not supported');
    }
    
    // Check for fetch support
    if (typeof fetch === 'undefined') {
        issues.push('Fetch API not supported');
    }
    
    // Check for MessageChannel support
    if (typeof MessageChannel === 'undefined') {
        issues.push('MessageChannel not supported');
    }
    
    if (issues.length > 0) {
        console.warn('[Preloader] Browser compatibility issues:', issues);
        return false;
    }
    
    return true;
}

// Only initialize preloader if browser is compatible
if (checkBrowserCompatibility()) {
    // Global error handler for preloader
    window.addEventListener('error', (event) => {
        if (event.filename && event.filename.includes('smart-preloader')) {
            console.error('[Preloader] Unhandled error:', event.error);
            // Disable preloading on critical errors
            if (window.SmartPreloader) {
                window.SmartPreloader.shouldPreload = false;
                window.SmartPreloader.isPreloading = false;
            }
        }
    });

    window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && event.reason.toString().includes('Preloader')) {
            console.error('[Preloader] Unhandled promise rejection:', event.reason);
            event.preventDefault(); // Prevent default error handling
        }
    });

    // Initialize preloader when script loads
    let smartPreloader;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (checkBrowserCompatibility()) {
                smartPreloader = new SmartModelPreloader();
                // Expose to global scope for debugging
                window.SmartPreloader = smartPreloader;
            } else {
                console.warn('[Preloader] Browser not compatible, skipping preloader');
                window.SmartPreloader = null;
            }
        });
    } else {
        if (checkBrowserCompatibility()) {
            smartPreloader = new SmartModelPreloader();
            // Expose to global scope for debugging
            window.SmartPreloader = smartPreloader;
        } else {
            console.warn('[Preloader] Browser not compatible, skipping preloader');
            window.SmartPreloader = null;
        }
    }
}
