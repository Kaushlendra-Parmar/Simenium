/**
 * Enhanced 3D Atom Viewer - Production Ready
 * 
 * This enhanced viewer uses all Simenium management systems for robust error handling,
 * performance monitoring, and production deployment compatibility.
 */

// =============================================================================
// CONFIGURATION
// =============================================================================
const CONFIG = {
    modelsPath: './models',
    fallbackColors: {
        proton: '#ff4444',
        neutron: '#888888',
        electron: '#4444ff'
    }
};

// Available models
const MODELS = [
    { name: 'atom.glb', displayName: 'Atom Structure' }
];

// =============================================================================
// GLOBAL VARIABLES
// =============================================================================
let scene, camera, renderer, controls;
let loadedModels = [];
let isInitialized = false;

// Pen functionality variables
let penMode = false;
let penCanvas, penCtx;
let drawing = false;
let lastPoint = null;
let penSettings = {
    tool: 'pen',
    color: '#2196F3',
    width: 3
};

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        console.log('🧬 Initializing Enhanced Atom Viewer...');
        
        // Show loading state
        SimeniumLoadingManager.show('canvas', {
            title: 'Loading Atom Viewer...',
            subtitle: 'Preparing 3D visualization',
            showProgress: true
        });
        
        // Check browser compatibility
        const compatibility = SimeniumCompatibilityChecker.checkCompatibility();
        if (!compatibility.webgl) {
            throw new Error('WebGL not supported - cannot display 3D models');
        }
        
        // Initialize mobile optimizations
        SimeniumMobileOptimizer.init();
        
        // Validate canvas element
        const canvasElement = SimeniumCanvasValidator.validateCanvas('canvas');
        if (!canvasElement) {
            throw new Error('Canvas element not found or invalid');
        }
        
        // Initialize Three.js with dependency loading
        await initThreeJS();
        
        // Load models
        await loadModels();
        
        // Set up controls and interactions
        setupControls();
        setupPenFunctionality();
        
        // Start render loop
        animate();
        
        // Mark as initialized
        isInitialized = true;
        
        // Show success state briefly
        SimeniumLoadingManager.showSuccess('canvas', {
            title: 'Atom Viewer Ready',
            subtitle: 'Explore the atomic structure!',
            hideDelay: 1500
        });
        
        // Start performance monitoring
        SimeniumPerformanceMonitor.startMonitoring();
        
        console.log('✅ Atom Viewer initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize Atom Viewer:', error);
        
        SimeniumLoadingManager.showError('canvas', {
            title: 'Initialization Failed',
            subtitle: error.message || 'Failed to load the atom viewer. Please try refreshing the page.',
            showRetry: true,
            retryCallback: initializeApp
        });
        
        SimeniumErrorHandler.handleError(error, 'Atom Viewer Initialization');
    }
}

/**
 * Initialize Three.js scene with enhanced error handling
 */
async function initThreeJS() {
    try {
        // Wait for Three.js to be available
        await SimeniumThreeJSConfig.waitForThreeJS();
        
        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color('#182024');
        
        // Camera
        const canvas = document.getElementById('canvas');
        const aspect = canvas.clientWidth / canvas.clientHeight;
        camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);
        
        // Renderer with mobile optimizations
        const rendererOptions = {
            canvas: canvas,
            antialias: !SimeniumMobileOptimizer.isLowPerformanceDevice(),
            alpha: false,
            powerPreference: SimeniumMobileOptimizer.isLowPerformanceDevice() ? 'low-power' : 'high-performance'
        };
        
        renderer = new THREE.WebGLRenderer(rendererOptions);
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, SimeniumMobileOptimizer.isLowPerformanceDevice() ? 1 : 2));
        
        renderer.shadowMap.enabled = !SimeniumMobileOptimizer.isLowPerformanceDevice();
        if (renderer.shadowMap.enabled) {
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // Controls
        if (typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.screenSpacePanning = false;
            controls.minDistance = 1;
            controls.maxDistance = 50;
            controls.maxPolarAngle = Math.PI;
            
            // Mobile optimizations for controls
            if (SimeniumMobileOptimizer.isMobile()) {
                controls.enableZoom = true;
                controls.enableRotate = true;
                controls.enablePan = false; // Disable panning on mobile for better UX
            }
        } else {
            console.warn('⚠️ OrbitControls not available - basic camera only');
        }
        
        // Lighting
        setupLighting();
        
        console.log('✅ Three.js initialized successfully');
        
    } catch (error) {
        throw new Error(`Three.js initialization failed: ${error.message}`);
    }
}

/**
 * Setup lighting for the scene
 */
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    
    if (renderer.shadowMap.enabled) {
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
    }
    
    scene.add(directionalLight);
    
    // Point light for better atom visibility
    const pointLight = new THREE.PointLight(0xffffff, 0.4, 100);
    pointLight.position.set(-10, -10, -10);
    scene.add(pointLight);
}

/**
 * Load 3D models with enhanced error handling and fallbacks
 */
async function loadModels() {
    try {
        const loadingManager = new THREE.LoadingManager();
        
        // Setup loading progress tracking
        SimeniumLoadingManager.showThreeJSLoading('canvas', loadingManager);
        
        for (const modelInfo of MODELS) {
            try {
                const modelPath = SimeniumPathResolver.resolvePath(`${CONFIG.modelsPath}/${modelInfo.name}`);
                
                console.log(`📦 Loading model: ${modelInfo.displayName}`);
                
                // Load model using Asset Manager
                const gltf = await SimeniumAssetManager.loadAsset(modelPath, {
                    type: 'model',
                    timeout: 30000,
                    retryOnError: true
                });
                
                if (gltf && gltf.scene) {
                    // Process the loaded model
                    const model = gltf.scene;
                    model.userData = { 
                        name: modelInfo.displayName,
                        originalPath: modelPath
                    };
                    
                    // Optimize model for performance
                    optimizeModel(model);
                    
                    // Add to scene
                    scene.add(model);
                    loadedModels.push({
                        name: modelInfo.displayName,
                        object: model,
                        visible: true
                    });
                    
                    console.log(`✅ Model loaded: ${modelInfo.displayName}`);
                    
                } else {
                    throw new Error('Invalid model data received');
                }
                
            } catch (modelError) {
                console.error(`❌ Failed to load model ${modelInfo.displayName}:`, modelError);
                
                // Try fallback
                const fallbackModel = createFallbackAtom();
                if (fallbackModel) {
                    fallbackModel.userData = { 
                        name: `${modelInfo.displayName} (Fallback)`,
                        isFallback: true
                    };
                    
                    scene.add(fallbackModel);
                    loadedModels.push({
                        name: `${modelInfo.displayName} (Fallback)`,
                        object: fallbackModel,
                        visible: true,
                        isFallback: true
                    });
                    
                    console.log(`🔄 Fallback model created for: ${modelInfo.displayName}`);
                }
            }
        }
        
        // Create UI buttons for loaded models
        createModelButtons();
        
        console.log(`📦 Models loading complete. Loaded: ${loadedModels.length} models`);
        
    } catch (error) {
        throw new Error(`Model loading failed: ${error.message}`);
    }
}

/**
 * Optimize model for better performance
 */
function optimizeModel(model) {
    model.traverse((child) => {
        if (child.isMesh) {
            // Enable/disable shadows based on performance
            child.castShadow = !SimeniumMobileOptimizer.isLowPerformanceDevice();
            child.receiveShadow = !SimeniumMobileOptimizer.isLowPerformanceDevice();
            
            // Optimize geometry
            if (child.geometry) {
                child.geometry.computeBoundingSphere();
                child.geometry.computeBoundingBox();
            }
            
            // Optimize materials
            if (child.material) {
                // Reduce material complexity on low-performance devices
                if (SimeniumMobileOptimizer.isLowPerformanceDevice()) {
                    child.material.envMapIntensity = 0.3;
                    if (child.material.roughness !== undefined) {
                        child.material.roughness = Math.max(0.5, child.material.roughness);
                    }
                }
            }
        }
    });
}

/**
 * Create fallback atom model when GLB loading fails
 */
function createFallbackAtom() {
    try {
        const atomGroup = new THREE.Group();
        
        // Create nucleus (protons and neutrons)
        const nucleusGroup = new THREE.Group();
        
        // Protons (red spheres)
        const protonGeometry = new THREE.SphereGeometry(0.3, 8, 6);
        const protonMaterial = new THREE.MeshPhongMaterial({ color: CONFIG.fallbackColors.proton });
        
        for (let i = 0; i < 6; i++) {
            const proton = new THREE.Mesh(protonGeometry, protonMaterial);
            proton.position.set(
                (Math.random() - 0.5) * 1.2,
                (Math.random() - 0.5) * 1.2,
                (Math.random() - 0.5) * 1.2
            );
            nucleusGroup.add(proton);
        }
        
        // Neutrons (gray spheres)
        const neutronMaterial = new THREE.MeshPhongMaterial({ color: CONFIG.fallbackColors.neutron });
        
        for (let i = 0; i < 6; i++) {
            const neutron = new THREE.Mesh(protonGeometry, neutronMaterial);
            neutron.position.set(
                (Math.random() - 0.5) * 1.2,
                (Math.random() - 0.5) * 1.2,
                (Math.random() - 0.5) * 1.2
            );
            nucleusGroup.add(neutron);
        }
        
        atomGroup.add(nucleusGroup);
        
        // Create electron orbits
        const electronGeometry = new THREE.SphereGeometry(0.1, 8, 6);
        const electronMaterial = new THREE.MeshPhongMaterial({ color: CONFIG.fallbackColors.electron });
        
        // First shell (2 electrons)
        for (let i = 0; i < 2; i++) {
            const electron = new THREE.Mesh(electronGeometry, electronMaterial);
            const angle = (i / 2) * Math.PI * 2;
            electron.position.set(
                Math.cos(angle) * 2,
                0,
                Math.sin(angle) * 2
            );
            electron.userData = { orbitRadius: 2, orbitSpeed: 0.02, angle: angle };
            atomGroup.add(electron);
        }
        
        // Second shell (8 electrons)
        for (let i = 0; i < 8; i++) {
            const electron = new THREE.Mesh(electronGeometry, electronMaterial);
            const angle = (i / 8) * Math.PI * 2;
            electron.position.set(
                Math.cos(angle) * 3.5,
                (Math.random() - 0.5) * 0.5,
                Math.sin(angle) * 3.5
            );
            electron.userData = { orbitRadius: 3.5, orbitSpeed: 0.015, angle: angle };
            atomGroup.add(electron);
        }
        
        atomGroup.userData.isFallback = true;
        atomGroup.userData.animateElectrons = true;
        
        return atomGroup;
        
    } catch (error) {
        console.error('❌ Failed to create fallback atom:', error);
        return null;
    }
}

/**
 * Create model toggle buttons
 */
function createModelButtons() {
    const buttonsContainer = document.getElementById('parts-buttons');
    if (!buttonsContainer) return;
    
    buttonsContainer.innerHTML = '';
    
    loadedModels.forEach((model, index) => {
        const button = document.createElement('button');
        button.textContent = model.name;
        button.className = 'model-btn';
        button.onclick = () => toggleModel(index);
        
        if (model.isFallback) {
            button.classList.add('fallback-model');
            button.title = 'Fallback model (original failed to load)';
        }
        
        buttonsContainer.appendChild(button);
    });
}

/**
 * Toggle model visibility
 */
function toggleModel(index) {
    if (index >= 0 && index < loadedModels.length) {
        const model = loadedModels[index];
        model.visible = !model.visible;
        model.object.visible = model.visible;
        
        // Update button appearance
        const buttons = document.querySelectorAll('.model-btn');
        if (buttons[index]) {
            buttons[index].classList.toggle('active', model.visible);
        }
    }
}

/**
 * Setup controls and event handlers
 */
function setupControls() {
    // Zoom controls
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    
    if (zoomInBtn && controls) {
        zoomInBtn.onclick = () => {
            camera.position.multiplyScalar(0.9);
            controls.update();
        };
    }
    
    if (zoomOutBtn && controls) {
        zoomOutBtn.onclick = () => {
            camera.position.multiplyScalar(1.1);
            controls.update();
        };
    }
    
    // Navigation buttons
    const homeBtn = document.getElementById('home-btn');
    const backBtn = document.getElementById('back-btn');
    
    if (homeBtn) {
        homeBtn.onclick = () => {
            window.location.href = '../index.html';
        };
    }
    
    if (backBtn) {
        backBtn.onclick = () => {
            window.history.back();
        };
    }
    
    // Settings and pen buttons
    const settingsBtn = document.getElementById('settings-btn');
    const penBtn = document.getElementById('pen-btn');
    
    if (settingsBtn) {
        settingsBtn.onclick = toggleSettings;
    }
    
    if (penBtn) {
        penBtn.onclick = togglePen;
    }
    
    // Window resize handler
    window.addEventListener('resize', onWindowResize, false);
}

/**
 * Setup pen functionality
 */
function setupPenFunctionality() {
    // Create pen canvas
    penCanvas = document.createElement('canvas');
    penCanvas.id = 'pen-canvas';
    penCanvas.style.position = 'absolute';
    penCanvas.style.top = '0';
    penCanvas.style.left = '0';
    penCanvas.style.pointerEvents = 'none';
    penCanvas.style.zIndex = '100';
    penCanvas.style.display = 'none';
    
    document.body.appendChild(penCanvas);
    
    penCtx = penCanvas.getContext('2d');
    
    // Resize pen canvas
    resizePenCanvas();
    
    // Setup pen event listeners
    setupPenEvents();
}

/**
 * Resize pen canvas to match window
 */
function resizePenCanvas() {
    if (penCanvas) {
        penCanvas.width = window.innerWidth;
        penCanvas.height = window.innerHeight;
        
        // Restore pen settings after resize
        if (penCtx) {
            penCtx.strokeStyle = penSettings.color;
            penCtx.lineWidth = penSettings.width;
            penCtx.lineCap = 'round';
            penCtx.lineJoin = 'round';
        }
    }
}

/**
 * Setup pen drawing events
 */
function setupPenEvents() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
}

/**
 * Toggle pen mode
 */
function togglePen() {
    penMode = !penMode;
    
    const penBtn = document.getElementById('pen-btn');
    const penCanvas = document.getElementById('pen-canvas');
    
    if (penMode) {
        penBtn.classList.add('active');
        penCanvas.style.display = 'block';
        penCanvas.style.pointerEvents = 'auto';
        
        // Disable orbit controls when pen is active
        if (controls) {
            controls.enabled = false;
        }
    } else {
        penBtn.classList.remove('active');
        penCanvas.style.pointerEvents = 'none';
        
        // Re-enable orbit controls
        if (controls) {
            controls.enabled = true;
        }
    }
}

/**
 * Start drawing
 */
function startDrawing(event) {
    if (!penMode || penSettings.tool !== 'pen') return;
    
    drawing = true;
    lastPoint = getEventPosition(event);
}

/**
 * Draw function
 */
function draw(event) {
    if (!drawing || !penMode) return;
    
    const currentPoint = getEventPosition(event);
    
    if (lastPoint && penCtx) {
        penCtx.globalCompositeOperation = penSettings.tool === 'eraser' ? 'destination-out' : 'source-over';
        penCtx.strokeStyle = penSettings.color;
        penCtx.lineWidth = penSettings.width;
        
        penCtx.beginPath();
        penCtx.moveTo(lastPoint.x, lastPoint.y);
        penCtx.lineTo(currentPoint.x, currentPoint.y);
        penCtx.stroke();
    }
    
    lastPoint = currentPoint;
}

/**
 * Stop drawing
 */
function stopDrawing() {
    drawing = false;
    lastPoint = null;
}

/**
 * Handle touch events
 */
function handleTouch(event) {
    event.preventDefault();
    
    const touch = event.touches[0];
    if (!touch) return;
    
    const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
    };
    
    switch (event.type) {
        case 'touchstart':
            startDrawing(mouseEvent);
            break;
        case 'touchmove':
            draw(mouseEvent);
            break;
    }
}

/**
 * Get event position
 */
function getEventPosition(event) {
    return {
        x: event.clientX,
        y: event.clientY
    };
}

/**
 * Toggle settings popup
 */
function toggleSettings() {
    const popup = document.getElementById('settings-popup');
    if (popup) {
        popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
    }
}

/**
 * Window resize handler
 */
function onWindowResize() {
    if (!isInitialized) return;
    
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    
    // Update camera
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    
    // Resize pen canvas
    resizePenCanvas();
}

/**
 * Animation loop with performance monitoring
 */
function animate() {
    if (!isInitialized) return;
    
    requestAnimationFrame(animate);
    
    try {
        // Update controls
        if (controls) {
            controls.update();
        }
        
        // Animate fallback models (electron orbits)
        animateFallbackModels();
        
        // Render scene
        renderer.render(scene, camera);
        
        // Update performance monitor
        SimeniumPerformanceMonitor.update();
        
    } catch (error) {
        console.error('❌ Render loop error:', error);
        SimeniumErrorHandler.handleError(error, 'Render Loop');
    }
}

/**
 * Animate fallback atom models
 */
function animateFallbackModels() {
    loadedModels.forEach(model => {
        if (model.object.userData.animateElectrons) {
            model.object.traverse(child => {
                if (child.userData.orbitRadius) {
                    child.userData.angle += child.userData.orbitSpeed;
                    child.position.x = Math.cos(child.userData.angle) * child.userData.orbitRadius;
                    child.position.z = Math.sin(child.userData.angle) * child.userData.orbitRadius;
                }
            });
        }
    });
}

/**
 * Cleanup function
 */
function cleanup() {
    console.log('🧹 Cleaning up Atom Viewer...');
    
    // Stop performance monitoring
    SimeniumPerformanceMonitor.stopMonitoring();
    
    // Clean up Three.js resources
    SimeniumMemoryManager.cleanup(scene, renderer);
    
    // Remove event listeners
    window.removeEventListener('resize', onWindowResize);
    
    // Clear asset cache
    SimeniumAssetManager.clearCache();
    
    isInitialized = false;
}

// =============================================================================
// EVENT LISTENERS AND INITIALIZATION
// =============================================================================

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is hidden
        SimeniumPerformanceMonitor.pause();
    } else {
        // Resume when page becomes visible
        SimeniumPerformanceMonitor.resume();
    }
});

// Handle page unload
window.addEventListener('beforeunload', cleanup);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Handle critical errors
window.addEventListener('error', (event) => {
    if (event.error) {
        SimeniumErrorHandler.handleError(event.error, 'Global Error Handler');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
    SimeniumErrorHandler.handleError(
        new Error(`Unhandled promise rejection: ${event.reason}`),
        'Promise Rejection'
    );
});

console.log('🧬 Enhanced Atom Viewer script loaded');
