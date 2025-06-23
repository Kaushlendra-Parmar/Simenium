/**
 * Asset Validator and Loader for Simenium
 * Validates asset existence, handles fallbacks, and monitors loading
 */

window.SimeniumAssetManager = {
    assetCache: new Map(),
    loadingPromises: new Map(),
    validationCache: new Map(),
    retryAttempts: new Map(),
    maxRetries: 3,
    
    // Initialize asset manager
    init: function() {
        this.setupPreloadDetection();
    },
    
    // Setup preload detection
    setupPreloadDetection: function() {
        // Monitor failed resource loads
        window.addEventListener('error', (event) => {
            if (event.target && (event.target.tagName === 'IMG' || 
                                event.target.tagName === 'SCRIPT' || 
                                event.target.tagName === 'LINK')) {
                this.handleResourceError(event.target);
            }
        }, true);
    },
    
    // Handle resource loading errors
    handleResourceError: function(element) {
        const url = element.src || element.href;
        
        // Only warn in debug mode to avoid console noise
        if (window.location.search.includes('debug=true')) {
            console.warn(`⚠️ Failed to load resource: ${url}`);
        }
        
        if (window.SimeniumErrorHandler) {
            window.SimeniumErrorHandler.handleError(
                new Error(`Failed to load resource: ${url}`),
                'Asset Loading'
            );
        }
    },
    
    // Validate asset existence
    validateAsset: async function(url, type = 'auto') {
        // Check cache first
        if (this.validationCache.has(url)) {
            return this.validationCache.get(url);
        }
        
        try {
            const response = await fetch(url, { method: 'HEAD' });
            const isValid = response.ok;
            
            // Cache result
            this.validationCache.set(url, isValid);
            
            if (!isValid && window.location.search.includes('debug=true')) {
                console.warn(`⚠️ Asset validation failed: ${url} (${response.status})`);
            }
            
            return isValid;
        } catch (error) {
            if (window.location.search.includes('debug=true')) {
                console.error(`❌ Asset validation error for ${url}:`, error);
            }
            this.validationCache.set(url, false);
            return false;
        }
    },
    
    // Load asset with validation and fallback
    loadAsset: async function(url, options = {}) {
        const {
            type = 'auto',
            fallback = null,
            validateFirst = false,
            retryOnError = true,
            timeout = 30000
        } = options;
        
        const cacheKey = `${url}:${type}`;
        
        // Return cached asset if available
        if (this.assetCache.has(cacheKey)) {
            return this.assetCache.get(cacheKey);
        }
        
        // Return existing loading promise if in progress
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }
        
        const loadingPromise = this._loadAssetInternal(url, type, options);
        this.loadingPromises.set(cacheKey, loadingPromise);
        
        try {
            const result = await loadingPromise;
            this.assetCache.set(cacheKey, result);
            return result;
        } catch (error) {
            // Try fallback if available
            if (fallback && retryOnError) {
                console.warn(`⚠️ Loading ${url} failed, trying fallback: ${fallback}`);
                return this.loadAsset(fallback, { ...options, fallback: null });
            }
            throw error;
        } finally {
            this.loadingPromises.delete(cacheKey);
        }
    },
    
    // Internal asset loading logic
    _loadAssetInternal: async function(url, type, options) {
        const { validateFirst, timeout } = options;
        
        // Validate asset first if requested
        if (validateFirst) {
            const isValid = await this.validateAsset(url, type);
            if (!isValid) {
                throw new Error(`Asset validation failed: ${url}`);
            }
        }
        
        // Determine loading method based on type
        const detectedType = type === 'auto' ? this.detectAssetType(url) : type;
        
        switch (detectedType) {
            case 'image':
                return this.loadImage(url, timeout);
            case 'model':
                return this.loadModel(url, timeout);
            case 'json':
                return this.loadJSON(url, timeout);
            case 'text':
                return this.loadText(url, timeout);
            default:
                return this.loadGeneric(url, timeout);
        }
    },
    
    // Detect asset type from URL
    detectAssetType: function(url) {
        const extension = url.split('.').pop().toLowerCase();
        
        const typeMap = {
            'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 'svg': 'image', 'webp': 'image',
            'glb': 'model', 'gltf': 'model', 'obj': 'model', 'fbx': 'model', 'dae': 'model',
            'json': 'json',
            'txt': 'text', 'md': 'text', 'csv': 'text'
        };
        
        return typeMap[extension] || 'generic';
    },
    
    // Load image with timeout
    loadImage: function(url, timeout) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            let timeoutId;
            
            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    reject(new Error(`Image loading timeout: ${url}`));
                }, timeout);
            }
            
            img.onload = () => {
                if (timeoutId) clearTimeout(timeoutId);
                resolve(img);
            };
            
            img.onerror = () => {
                if (timeoutId) clearTimeout(timeoutId);
                reject(new Error(`Failed to load image: ${url}`));
            };
            
            img.src = url;
        });
    },
    
    // Load 3D model
    loadModel: function(url, timeout) {
        return new Promise((resolve, reject) => {
            if (!window.THREE) {
                reject(new Error('Three.js not available'));
                return;
            }
            
            let timeoutId;
            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    reject(new Error(`Model loading timeout: ${url}`));
                }, timeout);
            }
            
            const loader = new THREE.GLTFLoader();
            
            loader.load(
                url,
                (gltf) => {
                    if (timeoutId) clearTimeout(timeoutId);
                    resolve(gltf);
                },
                (progress) => {
                    // Progress callback - only log in debug mode
                    if (window.location.search.includes('debug=true')) {
                        console.log(`📦 Loading progress for ${url}:`, progress);
                    }
                },
                (error) => {
                    if (timeoutId) clearTimeout(timeoutId);
                    reject(new Error(`Failed to load model: ${url} - ${error.message}`));
                }
            );
        });
    },
    
    // Load JSON with timeout
    loadJSON: async function(url, timeout) {
        const controller = new AbortController();
        let timeoutId;
        
        if (timeout > 0) {
            timeoutId = setTimeout(() => {
                controller.abort();
            }, timeout);
        }
        
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (timeoutId) clearTimeout(timeoutId);
            return data;
        } catch (error) {
            if (timeoutId) clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error(`JSON loading timeout: ${url}`);
            }
            
            throw new Error(`Failed to load JSON: ${url} - ${error.message}`);
        }
    },
    
    // Load text with timeout
    loadText: async function(url, timeout) {
        const controller = new AbortController();
        let timeoutId;
        
        if (timeout > 0) {
            timeoutId = setTimeout(() => {
                controller.abort();
            }, timeout);
        }
        
        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'text/plain'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const text = await response.text();
            
            if (timeoutId) clearTimeout(timeoutId);
            return text;
        } catch (error) {
            if (timeoutId) clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error(`Text loading timeout: ${url}`);
            }
            
            throw new Error(`Failed to load text: ${url} - ${error.message}`);
        }
    },
    
    // Load generic asset
    loadGeneric: async function(url, timeout) {
        const controller = new AbortController();
        let timeoutId;
        
        if (timeout > 0) {
            timeoutId = setTimeout(() => {
                controller.abort();
            }, timeout);
        }
        
        try {
            const response = await fetch(url, {
                signal: controller.signal
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            
            if (timeoutId) clearTimeout(timeoutId);
            return blob;
        } catch (error) {
            if (timeoutId) clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error(`Asset loading timeout: ${url}`);
            }
            
            throw new Error(`Failed to load asset: ${url} - ${error.message}`);
        }
    },
    
    // Preload multiple assets
    preloadAssets: async function(urls, options = {}) {
        const { showProgress = false, progressCallback = null } = options;
        
        const total = urls.length;
        let loaded = 0;
        const results = new Map();
        
        const loadPromises = urls.map(async (urlInfo) => {
            const url = typeof urlInfo === 'string' ? urlInfo : urlInfo.url;
            const assetOptions = typeof urlInfo === 'string' ? {} : urlInfo.options || {};
            
            try {
                const result = await this.loadAsset(url, assetOptions);
                results.set(url, { success: true, data: result });
                loaded++;
                
                if (showProgress || progressCallback) {
                    const progress = (loaded / total) * 100;
                    console.log(`📦 Preload progress: ${Math.round(progress)}% (${loaded}/${total})`);
                    
                    if (progressCallback) {
                        progressCallback(progress, loaded, total, url);
                    }
                }
                
                return result;
            } catch (error) {
                console.error(`❌ Failed to preload ${url}:`, error);
                results.set(url, { success: false, error: error.message });
                loaded++;
                
                if (progressCallback) {
                    const progress = (loaded / total) * 100;
                    progressCallback(progress, loaded, total, url, error);
                }
                
                return null;
            }
        });
        
        await Promise.allSettled(loadPromises);
        
        console.log(`📦 Preload complete: ${loaded}/${total} assets processed`);
        return results;
    },
    
    // Clear cache
    clearCache: function() {
        this.assetCache.clear();
        this.validationCache.clear();
        this.retryAttempts.clear();
        console.log('📦 Asset cache cleared');
    },
    
    // Get cache stats
    getCacheStats: function() {
        return {
            assetCacheSize: this.assetCache.size,
            validationCacheSize: this.validationCache.size,
            activeLoads: this.loadingPromises.size
        };
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SimeniumAssetManager.init();
    });
} else {
    SimeniumAssetManager.init();
}

console.log('📦 Asset Manager loaded');
