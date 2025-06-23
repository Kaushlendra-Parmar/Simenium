/**
 * Centralized Three.js Library Configuration
 * Ensures consistent versions across all model viewers
 */

// Three.js Version Configuration
const THREEJS_CONFIG = {
    version: '0.157.0', // Latest stable version
    cdnBase: 'https://cdn.jsdelivr.net/npm/three@',
    
    // Core Three.js library
    core: 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js',
    
    // Essential addons/controls
    orbitControls: 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js',
    transformControls: 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/TransformControls.js',
    gltfLoader: 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/loaders/GLTFLoader.js',
    rectAreaLightHelper: 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/helpers/RectAreaLightHelper.js',
    rectAreaLightUniformsLib: 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/lights/RectAreaLightUniformsLib.js',
    
    // Animation library
    gsap: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'
};

// Dynamic script loader with error handling
function loadScript(src, callback, errorCallback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    
    script.onload = function() {
        console.log(`✅ Loaded: ${src}`);
        if (callback) callback();
    };
    
    script.onerror = function() {
        console.error(`❌ Failed to load: ${src}`);
        if (errorCallback) errorCallback();
    };
    
    document.head.appendChild(script);
}

// Load all Three.js dependencies in correct order
function loadThreeJSLibraries(callback) {
    let loadedCount = 0;
    const totalLibraries = 6;
    
    function checkComplete() {
        loadedCount++;
        if (loadedCount === totalLibraries && callback) {
            callback();
        }
    }
    
    function handleError(libName) {
        console.error(`Failed to load ${libName}. Using fallback.`);
        // Could implement fallback loading here
        checkComplete();
    }
    
    // Load in sequence to avoid dependency issues
    loadScript(THREEJS_CONFIG.core, () => {
        loadScript(THREEJS_CONFIG.orbitControls, checkComplete, () => handleError('OrbitControls'));
        loadScript(THREEJS_CONFIG.transformControls, checkComplete, () => handleError('TransformControls'));
        loadScript(THREEJS_CONFIG.gltfLoader, checkComplete, () => handleError('GLTFLoader'));
        loadScript(THREEJS_CONFIG.rectAreaLightUniformsLib, checkComplete, () => handleError('RectAreaLightUniformsLib'));
        loadScript(THREEJS_CONFIG.rectAreaLightHelper, checkComplete, () => handleError('RectAreaLightHelper'));
        loadScript(THREEJS_CONFIG.gsap, checkComplete, () => handleError('GSAP'));
    }, () => handleError('Three.js Core'));
}

// Export for use in model viewers
window.THREEJS_CONFIG = THREEJS_CONFIG;
window.loadThreeJSLibraries = loadThreeJSLibraries;
