/**
 * 3D Transformer Viewer - Simple Model Display
 * 
 * This viewer displays transformer models without complex positioning or animation features.
 * Models are loaded and displayed for educational viewing.
 */

// =============================================================================
// CONFIGURATION
// =============================================================================
const CONFIG = {
    modelsPath: './models',
};

// Available models
const MODELS = [
    { name: 'model_of_dc_motor_working_principle.glb', displayName: 'DC Motor Working Principle' }
];

// =============================================================================
// GLOBAL VARIABLES
// =============================================================================
let scene, camera, renderer, controls;
let loadedModels = [];

// Animation variables
let mixer = null;
let animationActions = [];
let isPlaying = false;
let clock = new THREE.Clock();

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
// THREE.JS INITIALIZATION
// =============================================================================

// Initialize Three.js scene
function initThreeJS() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#182024');

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);    // Enhanced color accuracy settings to match Blender with better exposure
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ReinhardToneMapping; // Better for bright lighting
    renderer.toneMappingExposure = 0.3; // Reduced exposure by another 50% (was 1.25)
    renderer.physicallyCorrectLights = true;
    renderer.gammaFactor = 2.2; // Explicit gamma correction
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;    controls.dampingFactor = 0.05;    controls.enablePan = true;    // Lighting - Enhanced systematic 6-directional lighting setup for superior coverage
    const ambientLight = new THREE.AmbientLight(0xffffff, 18.0); // Restored enhanced ambient light
    scene.add(ambientLight);

    // PRIMARY DIRECTIONAL LIGHTS - Enhanced intensities for optimal coverage
    // Front light
    const frontLight = new THREE.DirectionalLight(0xffffff, 12.0); // Enhanced intensity
    frontLight.position.set(0, 5, 15);
    scene.add(frontLight);

    // Back light
    const backLight = new THREE.DirectionalLight(0xffffff, 12.0); // Enhanced intensity
    backLight.position.set(0, 5, -15);
    scene.add(backLight);    // Left light
    const leftLight = new THREE.DirectionalLight(0xffffff, 11.0); // Enhanced intensity
    leftLight.position.set(-15, 5, 0);
    scene.add(leftLight);

    // Right light
    const rightLight = new THREE.DirectionalLight(0xffffff, 11.0); // Enhanced intensity
    rightLight.position.set(15, 5, 0);
    scene.add(rightLight);

    // Top light
    const topLight = new THREE.DirectionalLight(0xffffff, 14.0); // Enhanced intensity
    topLight.position.set(0, 20, 0);
    scene.add(topLight);

    // Bottom light
    const bottomLight = new THREE.DirectionalLight(0xffffff, 8.0); // Enhanced intensity
    bottomLight.position.set(0, -10, 0);
    bottomLight.target.position.set(0, 0, 0);
    scene.add(bottomLight);
    scene.add(bottomLight.target);

    // ENHANCED PANEL LIGHTS - Six directions with superior illumination
    // Front panel lights
    const frontPanel1 = new THREE.RectAreaLight(0xffffff, 4.5, 8, 6); // Enhanced intensity
    frontPanel1.position.set(0, 8, 12);
    frontPanel1.lookAt(0, 0, 0);    scene.add(frontPanel1);

    const frontPanel2 = new THREE.RectAreaLight(0xffffff, 3.8, 6, 4); // Enhanced intensity
    frontPanel2.position.set(0, 2, 10);
    frontPanel2.lookAt(0, 0, 0);
    scene.add(frontPanel2);

    // Back panel lights
    const backPanel1 = new THREE.RectAreaLight(0xffffff, 4.5, 8, 6); // Enhanced intensity
    backPanel1.position.set(0, 8, -12);
    backPanel1.lookAt(0, 0, 0);
    scene.add(backPanel1);

    const backPanel2 = new THREE.RectAreaLight(0xffffff, 3.8, 6, 4); // Enhanced intensity
    backPanel2.position.set(0, 2, -10);
    backPanel2.lookAt(0, 0, 0);
    scene.add(backPanel2);

    // Left panel lights
    const leftPanel1 = new THREE.RectAreaLight(0xffffff, 4.2, 6, 8); // Enhanced intensity
    leftPanel1.position.set(-12, 8, 0);
    leftPanel1.lookAt(0, 0, 0);
    scene.add(leftPanel1);

    const leftPanel2 = new THREE.RectAreaLight(0xffffff, 3.5, 4, 6); // Enhanced intensity
    leftPanel2.position.set(-10, 2, 0);
    leftPanel2.lookAt(0, 0, 0);
    scene.add(leftPanel2);

    // Right panel lights
    const rightPanel1 = new THREE.RectAreaLight(0xffffff, 4.2, 6, 8); // Enhanced intensity    rightPanel1.position.set(12, 8, 0);
    rightPanel1.lookAt(0, 0, 0);
    scene.add(rightPanel1);

    const rightPanel2 = new THREE.RectAreaLight(0xffffff, 3.5, 4, 6); // Enhanced intensity
    rightPanel2.position.set(10, 2, 0);
    rightPanel2.lookAt(0, 0, 0);
    scene.add(rightPanel2);

    // Top panel lights
    const topPanel1 = new THREE.RectAreaLight(0xffffff, 6.0, 10, 10); // Enhanced intensity
    topPanel1.position.set(0, 15, 0);
    topPanel1.lookAt(0, 0, 0);
    scene.add(topPanel1);

    const topPanel2 = new THREE.RectAreaLight(0xffffff, 5.2, 8, 8); // Enhanced intensity
    topPanel2.position.set(0, 12, 0);
    topPanel2.lookAt(0, 0, 0);
    scene.add(topPanel2);

    // Bottom panel lights
    const bottomPanel1 = new THREE.RectAreaLight(0xffffff, 3.0, 8, 8); // Enhanced intensity
    bottomPanel1.position.set(0, -5, 0);
    bottomPanel1.lookAt(0, 0, 0);
    scene.add(bottomPanel1);

    const bottomPanel2 = new THREE.RectAreaLight(0xffffff, 2.3, 6, 6); // Enhanced intensity
    bottomPanel2.position.set(0, -3, 0);
    bottomPanel2.lookAt(0, 0, 0);
    scene.add(bottomPanel2);    // ENHANCED CORNER LIGHTS - Superior coverage for edges and details
    // Front corners
    const frontTopLeft = new THREE.RectAreaLight(0xffffff, 2.3, 4, 4); // Enhanced intensity
    frontTopLeft.position.set(-6, 10, 8);
    frontTopLeft.lookAt(0, 0, 0);
    scene.add(frontTopLeft);

    const frontTopRight = new THREE.RectAreaLight(0xffffff, 2.3, 4, 4); // Enhanced intensity
    frontTopRight.position.set(6, 10, 8);
    frontTopRight.lookAt(0, 0, 0);
    scene.add(frontTopRight);

    // Back corners
    const backTopLeft = new THREE.RectAreaLight(0xffffff, 2.3, 4, 4); // Enhanced intensity
    backTopLeft.position.set(-6, 10, -8);
    backTopLeft.lookAt(0, 0, 0);
    scene.add(backTopLeft);

    const backTopRight = new THREE.RectAreaLight(0xffffff, 2.3, 4, 4); // Enhanced intensity
    backTopRight.position.set(6, 10, -8);
    backTopRight.lookAt(0, 0, 0);
    scene.add(backTopRight);

    // ADDITIONAL STRATEGIC FILL LIGHTS - Complete illumination coverage
    // Mid-level corner lights for comprehensive coverage
    const midLeftFront = new THREE.RectAreaLight(0xffffff, 1.8, 3, 3);
    midLeftFront.position.set(-8, 5, 6);
    midLeftFront.lookAt(0, 0, 0);
    scene.add(midLeftFront);

    const midRightFront = new THREE.RectAreaLight(0xffffff, 1.8, 3, 3);
    midRightFront.position.set(8, 5, 6);
    midRightFront.lookAt(0, 0, 0);
    scene.add(midRightFront);

    const midLeftBack = new THREE.RectAreaLight(0xffffff, 1.8, 3, 3);
    midLeftBack.position.set(-8, 5, -6);
    midLeftBack.lookAt(0, 0, 0);
    scene.add(midLeftBack);

    const midRightBack = new THREE.RectAreaLight(0xffffff, 1.8, 3, 3);
    midRightBack.position.set(8, 5, -6);
    midRightBack.lookAt(0, 0, 0);
    scene.add(midRightBack);

    // Window resize handler
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// =============================================================================
// MODEL MANAGEMENT
// =============================================================================

// Setup model buttons
function setupModelButtons() {
    const partsButtons = document.getElementById('parts-buttons');
    if (!partsButtons) {
        console.error('parts-buttons element not found');
        return;
    }
    
    // If there's only one model, hide the sidebar
    if (MODELS.length === 1) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.display = 'none';
        }
        
        // Adjust main content to use full width
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.style.marginLeft = '0';
            mainContent.style.width = '100%';
        }
        
        // Load the single model automatically
        loadModel(MODELS[0].name);
        return;
    }
    
    partsButtons.innerHTML = '';
    
    // Create buttons for models
    MODELS.forEach((modelInfo, idx) => {
        const btn = document.createElement('button');
        btn.className = 'part-btn';
        btn.dataset.model = modelInfo.name;
        btn.textContent = modelInfo.displayName;
        partsButtons.appendChild(btn);
    });
      // Load first model immediately for best performance
    if (MODELS.length > 0) {
        // Mark first button as selected
        const firstBtn = partsButtons.querySelector('.part-btn');
        if (firstBtn) firstBtn.classList.add('selected');
        
        // Load model immediately for optimal performance
        loadModel(MODELS[0].name);
    }
    
    // Attach event listeners for buttons
    document.querySelectorAll('.part-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            // Remove selection from all buttons
            document.querySelectorAll('.part-btn').forEach(btn => btn.classList.remove('selected'));
            // Add selection to clicked button
            button.classList.add('selected');
            // Load the model
            const modelName = button.dataset.model;
            loadModel(modelName);
        });
    });
}

// Load and display a 3D model
function loadModel(modelName) {
    const loader = new THREE.GLTFLoader();
    const modelPath = `${CONFIG.modelsPath}/${modelName}`;

    console.log(`Loading model: ${modelPath}`);    // Clear existing models
    loadedModels.forEach(model => scene.remove(model));
    loadedModels = [];
    
    // Reset animation state
    if (mixer) {
        mixer.stopAllAction();
        mixer = null;
    }
    animationActions = [];
    isPlaying = false;
    
    // Clear existing animations
    if (mixer) {
        mixer.stopAllAction();
        mixer = null;
    }
    animationActions = [];
    isPlaying = false;loader.load(
        modelPath,
        (gltf) => {
            const model = gltf.scene;
            model.name = modelName;            // Preserve materials and colors from Blender with enhanced accuracy
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    // Handle different material types
                    const materials = Array.isArray(child.material) ? child.material : [child.material];
                    
                    materials.forEach(material => {
                        // Ensure proper color space handling for all texture types
                        if (material.map) {
                            material.map.encoding = THREE.sRGBEncoding;
                            material.map.flipY = false; // Prevent texture flipping issues
                        }
                        if (material.emissiveMap) {
                            material.emissiveMap.encoding = THREE.sRGBEncoding;
                        }
                        if (material.normalMap) {
                            material.normalMap.encoding = THREE.LinearEncoding;
                        }
                        if (material.roughnessMap) {
                            material.roughnessMap.encoding = THREE.LinearEncoding;
                        }
                        if (material.metalnessMap) {
                            material.metalnessMap.encoding = THREE.LinearEncoding;
                        }
                        if (material.aoMap) {
                            material.aoMap.encoding = THREE.LinearEncoding;
                        }
                        
                        // Enhanced color handling for better visibility
                        if (material.color) {
                            // Don't convert colors - keep them as they are for better visibility
                            material.color.multiplyScalar(1.2); // Slightly brighten base colors
                        }
                        if (material.emissive) {
                            material.emissive.multiplyScalar(0.3); // Add slight emissive glow
                        }
                        
                        // Adjust material properties for better lighting response
                        if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
                            material.roughness = Math.max(0.1, material.roughness || 0.5);
                            material.metalness = material.metalness || 0.0;
                        }
                        
                        // Force material update
                        material.needsUpdate = true;
                    });
                }            });// Apply model-specific scaling (reduced to 0.5x)
            let scale = 0.5; // Default scale reduced to half size
            model.scale.setScalar(scale);

            // Center model at origin
            const box = new THREE.Box3().setFromObject(model);
            const center = new THREE.Vector3();
            box.getCenter(center);
            model.position.sub(center);            scene.add(model);
            loadedModels.push(model);

            // Setup animations if available
            if (gltf.animations && gltf.animations.length > 0) {
                // Create animation mixer
                mixer = new THREE.AnimationMixer(model);
                animationActions = [];
                
                // Add all animations to the mixer
                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    animationActions.push(action);
                    action.setLoop(THREE.LoopRepeat);
                });
                
                if (window.location.search.includes('debug=true')) {
                    console.log(`Found ${gltf.animations.length} animation(s) in the model`);
                }
                
                // Show animation controls
                updateAnimationControls();
            } else {
                // Hide animation controls if no animations
                const animationControls = document.getElementById('animation-controls');
                if (animationControls) {
                    animationControls.style.display = 'none';
                }
            }

            // Only log in debug mode to improve performance
            if (window.location.search.includes('debug=true')) {
                console.log(`Model ${modelName} loaded successfully`);
            }
        },
        (progress) => {
            // Only log progress in debug mode to improve performance
            if (window.location.search.includes('debug=true')) {
                console.log('Loading progress:', (progress.loaded / progress.total * 100) + '% loaded');
            }
        },
        (error) => {
            console.error('Error loading model:', error);
        }
    );
}

// =============================================================================
// ZOOM FUNCTIONALITY
// =============================================================================

// Animate zooming the model in/out
function animateModelZoom(factor) {
    if (loadedModels.length === 0) return;
    
    // Get current scale and apply zoom factor directly
    loadedModels.forEach(model => {
        const currentScale = model.scale.x;
        const targetScale = currentScale * factor;
        
        gsap.to(model.scale, {
            x: targetScale,
            y: targetScale,
            z: targetScale,
            duration: 0.5,
            ease: 'power2.inOut'
        });
    });
}

// =============================================================================
// ANIMATION FUNCTIONALITY
// =============================================================================

// Play animation
function playAnimation() {
    if (mixer && animationActions.length > 0) {
        animationActions.forEach(action => {
            if (!action.isRunning()) {
                action.reset();
            }
            action.paused = false;
            action.play();
        });
        isPlaying = true;
        updateAnimationControls();
        
        if (window.location.search.includes('debug=true')) {
            console.log('Animation started');
        }
    }
}

// Pause animation
function pauseAnimation() {
    if (mixer && animationActions.length > 0) {
        animationActions.forEach(action => {
            action.paused = true;
        });
        isPlaying = false;
        updateAnimationControls();
        
        if (window.location.search.includes('debug=true')) {
            console.log('Animation paused');
        }
    }
}

// Resume animation
function resumeAnimation() {
    if (mixer && animationActions.length > 0) {
        animationActions.forEach(action => {
            action.paused = false;
        });
        isPlaying = true;
        updateAnimationControls();
        
        if (window.location.search.includes('debug=true')) {
            console.log('Animation resumed');
        }
    }
}

// Update animation control button visibility
function updateAnimationControls() {
    const animationControls = document.getElementById('animation-controls');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    
    if (!animationControls || !playBtn || !pauseBtn) return;
    
    if (mixer && animationActions.length > 0) {
        animationControls.style.display = 'flex';
        
        if (isPlaying) {
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'flex';
            pauseBtn.classList.add('active');
        } else {
            playBtn.style.display = 'flex';
            pauseBtn.style.display = 'none';
            pauseBtn.classList.remove('active');
        }
    } else {
        animationControls.style.display = 'none';
    }
}

// =============================================================================
// PEN FUNCTIONALITY
// =============================================================================

// Initialize pen functionality
function initPenFeatures() {
    // Create pen canvas overlay
    penCanvas = document.createElement('canvas');
    penCanvas.id = 'pen-canvas';
    penCanvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        display: none;
    `;
    document.body.appendChild(penCanvas);
    penCtx = penCanvas.getContext('2d');
    
    // Set initial canvas size
    resizePenCanvas();

    // Pen button toggle
    const penBtn = document.getElementById('pen-btn');
    if (penBtn) {
        penBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            penMode = !penMode;
            
            if (penMode) {
                penBtn.classList.add('selected');
                enablePen();
            } else {
                penBtn.classList.remove('selected');
                disablePen();
            }
        });
    } else {
        console.error('Pen button not found!');
    }
}

// Enable pen mode
function enablePen() {
    console.log('Enabling pen mode...');
    penCanvas.style.display = 'block';
    penCanvas.style.pointerEvents = 'auto';
    controls.enabled = false; // Disable orbit controls when drawing
    
    // Add drawing event listeners
    penCanvas.addEventListener('pointerdown', penPointerDown);
    penCanvas.addEventListener('pointermove', penPointerMove);
    penCanvas.addEventListener('pointerup', penPointerUp);
}

// Disable pen mode
function disablePen() {
    console.log('Disabling pen mode...');
    penCanvas.style.display = 'none';
    penCanvas.style.pointerEvents = 'none';
    controls.enabled = true; // Re-enable orbit controls
    
    // Remove drawing event listeners
    penCanvas.removeEventListener('pointerdown', penPointerDown);
    penCanvas.removeEventListener('pointermove', penPointerMove);
    penCanvas.removeEventListener('pointerup', penPointerUp);
    
    drawing = false;
    lastPoint = null;
    
    // Clear the canvas content when disabling pen mode
    penCtx.clearRect(0, 0, penCanvas.width, penCanvas.height);
}

// Pen drawing event handlers
function penPointerDown(e) {
    drawing = true;
    const rect = penCanvas.getBoundingClientRect();
    lastPoint = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function penPointerMove(e) {
    if (!drawing) return;
    
    const rect = penCanvas.getBoundingClientRect();
    const currentPoint = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    
    penCtx.globalCompositeOperation = penSettings.tool === 'eraser' ? 'destination-out' : 'source-over';
    penCtx.strokeStyle = penSettings.color;
    penCtx.lineWidth = penSettings.width;
    penCtx.lineCap = 'round';
    penCtx.lineJoin = 'round';
    
    penCtx.beginPath();
    penCtx.moveTo(lastPoint.x, lastPoint.y);
    penCtx.lineTo(currentPoint.x, currentPoint.y);
    penCtx.stroke();
    
    lastPoint = currentPoint;
}

function penPointerUp(e) {
    drawing = false;
    lastPoint = null;
}

function resizePenCanvas() {
    if (!penCanvas) return;
    // Save current drawing
    const imageData = penCtx.getImageData(0, 0, penCanvas.width, penCanvas.height);
    penCanvas.width = window.innerWidth;
    penCanvas.height = window.innerHeight;
    // Restore drawing
    penCtx.putImageData(imageData, 0, 0);
}

// =============================================================================
// SETTINGS FUNCTIONALITY
// =============================================================================

// Update pen settings
function updatePenSettings() {
    // Update width dots to reflect current color
    updateWidthDots();
    
    // Show/hide appropriate width panels based on current tool
    const penWidths = document.getElementById('settings-widths-pen');
    const eraserWidths = document.getElementById('settings-widths-eraser');
    
    if (penSettings.tool === 'pen') {
        if (penWidths) penWidths.style.display = 'flex';
        if (eraserWidths) eraserWidths.style.display = 'none';
    } else if (penSettings.tool === 'eraser') {
        if (penWidths) penWidths.style.display = 'none';
        if (eraserWidths) eraserWidths.style.display = 'flex';
    }
}

// Helper function to update width dot colors
function updateWidthDots() {
    // Update pen width dots with current pen color
    const penWidthDots = document.querySelectorAll('#settings-widths-pen .width-dot');
    penWidthDots.forEach(dot => {
        dot.style.background = penSettings.color;
        dot.style.boxShadow = `0 0 0 2px ${penSettings.color}`;
    });
    
    // Eraser dots stay gray (they don't change color)
    const eraserWidthDots = document.querySelectorAll('#settings-widths-eraser .width-dot');
    eraserWidthDots.forEach(dot => {
        dot.style.background = '#888';
        dot.style.boxShadow = '0 0 0 2px #888';
    });
}

// Settings popup functionality
function initSettingsFeatures() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPopup = document.getElementById('settings-popup');
    let settingsOpen = false;

    if (!settingsBtn || !settingsPopup) return;

    settingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle settings popup
        settingsOpen = !settingsOpen;
        settingsPopup.style.display = settingsOpen ? 'flex' : 'none';
        settingsBtn.classList.toggle('selected', settingsOpen);
        
        // Initialize width dots with correct colors when opening
        if (settingsOpen) {
            updatePenSettings();
        }
        
        // If opening settings and pen mode is not active, activate it
        if (settingsOpen && !penMode) {
            penMode = true;
            const penBtn = document.getElementById('pen-btn');
            if (penBtn) penBtn.classList.add('selected');
            enablePen();
        }
    });

    // Tool selection
    settingsPopup.querySelectorAll('.settings-tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            settingsPopup.querySelectorAll('.settings-tool-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            penSettings.tool = btn.dataset.tool;
            updatePenSettings();
        });
    });

    // Color selection
    settingsPopup.querySelectorAll('.settings-color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            settingsPopup.querySelectorAll('.settings-color-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            penSettings.color = btn.dataset.color;
            updatePenSettings();
        });
    });

    // Width selection
    settingsPopup.querySelectorAll('.settings-width-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove selected from current tool's width buttons
            const currentToolWidths = settingsPopup.querySelectorAll(`#settings-widths-${penSettings.tool} .settings-width-btn`);
            currentToolWidths.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            penSettings.width = parseInt(btn.dataset.width);
            updatePenSettings();
        });
    });

    // Close popup when clicking outside
    document.addEventListener('click', (e) => {
        if (settingsOpen && 
            !settingsPopup.contains(e.target) && 
            !settingsBtn.contains(e.target)) {
            settingsOpen = false;
            settingsPopup.style.display = 'none';
            settingsBtn.classList.remove('selected');
        }
    });
}

// =============================================================================
// UI SETUP
// =============================================================================

// Setup UI event handlers
function setupUIHandlers() {
    // Zoom controls
    document.getElementById('zoom-in-btn').addEventListener('click', () => animateModelZoom(1.2));
    document.getElementById('zoom-out-btn').addEventListener('click', () => animateModelZoom(0.8));
      
    // Home button
    document.getElementById('home-btn').addEventListener('click', () => {
        window.location.href = '../index.html';
    });
    
    // Back button
    document.getElementById('back-btn').addEventListener('click', () => {
        window.history.back();
    });
    
    // Animation controls
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (mixer && animationActions.length > 0) {
                playAnimation();
            }
        });
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (mixer && animationActions.length > 0) {
                pauseAnimation();
            }
        });
    }
    
    // Initialize pen and settings features
    initPenFeatures();
    initSettingsFeatures();
    
    // Add window resize handler for pen canvas
    window.addEventListener('resize', resizePenCanvas);
}

// =============================================================================
// ANIMATION LOOP
// =============================================================================

function animate() {
    requestAnimationFrame(animate);
    
    // Update animation mixer
    const delta = clock.getDelta();
    if (mixer) {
        mixer.update(delta);
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing 3D Insulators Viewer...');
    
    // Initialize Three.js
    initThreeJS();
    
    // Setup model buttons
    setupModelButtons();
    
    // Setup UI handlers
    setupUIHandlers();
    
    // Start animation loop
    animate();
    
    console.log('3D Insulators Viewer initialized successfully');
});

