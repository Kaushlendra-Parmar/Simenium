/**
 * 3D Cell Viewer - Simple Model Display
 * 
 * This viewer displays cell models without complex positioning or animation features.
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
    { name: 'animal_cell_-_downloadable.glb', displayName: 'Animal Cell' },
    { name: 'human_cell.glb', displayName: 'Human Cell' },
    { name: 'plant_cell_organelles.glb', displayName: 'Plant Cell Organelles' }
];

// =============================================================================
// GLOBAL VARIABLES
// =============================================================================
let scene, camera, renderer, controls;
let loadedModels = [];

// Store lighting references for dynamic adjustment
let lightingSystem = {
    ambientLight: null,
    directionalLights: [],
    panelLights: [],
    originalIntensities: {}
};

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
    renderer.setPixelRatio(window.devicePixelRatio);    // Enhanced color accuracy settings to match Blender
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // More accurate tone mapping
    renderer.toneMappingExposure = 1.2; // Slightly brighter exposure
    renderer.physicallyCorrectLights = true;
    renderer.gammaFactor = 2.2; // Explicit gamma correction
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;    controls.dampingFactor = 0.05;    controls.enablePan = true;    // Lighting - Multi-directional lighting setup for better coverage
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
    scene.add(ambientLight);
    lightingSystem.ambientLight = ambientLight;
    lightingSystem.originalIntensities.ambient = 2.4;

    // Primary directional lights from different angles
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 2.8);
    directionalLight1.position.set(10, 20, 10);
    scene.add(directionalLight1);
    lightingSystem.directionalLights.push(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight2.position.set(-10, 10, -10);
    scene.add(directionalLight2);
    lightingSystem.directionalLights.push(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1.6);
    directionalLight3.position.set(0, 15, -15);
    scene.add(directionalLight3);
    lightingSystem.directionalLights.push(directionalLight3);

    const directionalLight4 = new THREE.DirectionalLight(0xffffff, 1.44);
    directionalLight4.position.set(-15, 5, 0);
    scene.add(directionalLight4);
    lightingSystem.directionalLights.push(directionalLight4);

    const directionalLight5 = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight5.position.set(15, 8, -5);
    scene.add(directionalLight5);
    lightingSystem.directionalLights.push(directionalLight5);

    // Store original directional light intensities
    lightingSystem.originalIntensities.directional = [2.8, 2.0, 1.6, 1.44, 1.2];    // Panel lights from multiple directions for even softer illumination
    const rectLight1 = new THREE.RectAreaLight(0xffffff, 0.96, 8, 8);
    rectLight1.position.set(0, 12, 0);
    rectLight1.lookAt(0, 0, 0);
    scene.add(rectLight1);
    lightingSystem.panelLights.push(rectLight1);

    const rectLight2 = new THREE.RectAreaLight(0xffffff, 0.8, 6, 6);
    rectLight2.position.set(8, 5, 8);
    rectLight2.lookAt(0, 0, 0);
    scene.add(rectLight2);
    lightingSystem.panelLights.push(rectLight2);

    const rectLight3 = new THREE.RectAreaLight(0xffffff, 0.64, 6, 6);
    rectLight3.position.set(-8, 5, -8);
    rectLight3.lookAt(0, 0, 0);
    scene.add(rectLight3);
    lightingSystem.panelLights.push(rectLight3);

    const rectLight4 = new THREE.RectAreaLight(0xffffff, 0.56, 5, 5);
    rectLight4.position.set(0, 3, 10);
    rectLight4.lookAt(0, 0, 0);
    scene.add(rectLight4);
    lightingSystem.panelLights.push(rectLight4);

    const rectLight5 = new THREE.RectAreaLight(0xffffff, 0.48, 5, 5);
    rectLight5.position.set(0, 3, -10);
    rectLight5.lookAt(0, 0, 0);
    scene.add(rectLight5);
    lightingSystem.panelLights.push(rectLight5);

    // ADDITIONAL PANEL LIGHTS - Six directions systematic coverage
    // Front panel lights (additional to existing)
    const frontPanel1 = new THREE.RectAreaLight(0xffffff, 1.2, 8, 6);
    frontPanel1.position.set(0, 8, 12);
    frontPanel1.lookAt(0, 0, 0);
    scene.add(frontPanel1);
    lightingSystem.panelLights.push(frontPanel1);

    const frontPanel2 = new THREE.RectAreaLight(0xffffff, 0.96, 6, 4);
    frontPanel2.position.set(0, 2, 10);
    frontPanel2.lookAt(0, 0, 0);
    scene.add(frontPanel2);
    lightingSystem.panelLights.push(frontPanel2);

    // Back panel lights (additional to existing)
    const backPanel1 = new THREE.RectAreaLight(0xffffff, 1.2, 8, 6);
    backPanel1.position.set(0, 8, -12);
    backPanel1.lookAt(0, 0, 0);
    scene.add(backPanel1);
    lightingSystem.panelLights.push(backPanel1);

    const backPanel2 = new THREE.RectAreaLight(0xffffff, 0.96, 6, 4);
    backPanel2.position.set(0, 2, -10);
    backPanel2.lookAt(0, 0, 0);
    scene.add(backPanel2);
    lightingSystem.panelLights.push(backPanel2);

    // Left panel lights
    const leftPanel1 = new THREE.RectAreaLight(0xffffff, 1.12, 6, 8);
    leftPanel1.position.set(-12, 8, 0);
    leftPanel1.lookAt(0, 0, 0);
    scene.add(leftPanel1);
    lightingSystem.panelLights.push(leftPanel1);

    const leftPanel2 = new THREE.RectAreaLight(0xffffff, 0.88, 4, 6);
    leftPanel2.position.set(-10, 2, 0);
    leftPanel2.lookAt(0, 0, 0);
    scene.add(leftPanel2);
    lightingSystem.panelLights.push(leftPanel2);

    // Right panel lights
    const rightPanel1 = new THREE.RectAreaLight(0xffffff, 1.12, 6, 8);
    rightPanel1.position.set(12, 8, 0);
    rightPanel1.lookAt(0, 0, 0);
    scene.add(rightPanel1);
    lightingSystem.panelLights.push(rightPanel1);

    const rightPanel2 = new THREE.RectAreaLight(0xffffff, 0.88, 4, 6);
    rightPanel2.position.set(10, 2, 0);
    rightPanel2.lookAt(0, 0, 0);
    scene.add(rightPanel2);
    lightingSystem.panelLights.push(rightPanel2);

    // Top panel lights (additional to existing)
    const topPanel1 = new THREE.RectAreaLight(0xffffff, 1.44, 10, 10);
    topPanel1.position.set(0, 15, 0);
    topPanel1.lookAt(0, 0, 0);
    scene.add(topPanel1);
    lightingSystem.panelLights.push(topPanel1);

    const topPanel2 = new THREE.RectAreaLight(0xffffff, 1.2, 8, 8);
    topPanel2.position.set(0, 12, 0);
    topPanel2.lookAt(0, 0, 0);
    scene.add(topPanel2);
    lightingSystem.panelLights.push(topPanel2);

    // Bottom panel lights (to complement existing bottom directional light)
    const bottomPanel1 = new THREE.RectAreaLight(0xffffff, 0.8, 8, 8);
    bottomPanel1.position.set(0, -5, 0);
    bottomPanel1.lookAt(0, 0, 0);
    scene.add(bottomPanel1);
    lightingSystem.panelLights.push(bottomPanel1);

    const bottomPanel2 = new THREE.RectAreaLight(0xffffff, 0.64, 6, 6);
    bottomPanel2.position.set(0, -3, 0);
    bottomPanel2.lookAt(0, 0, 0);
    scene.add(bottomPanel2);
    lightingSystem.panelLights.push(bottomPanel2);

    // Bottom light for under-illumination
    const bottomLight = new THREE.DirectionalLight(0xffffff, 1.2);
    bottomLight.position.set(0, -10, 0);
    bottomLight.target.position.set(0, 0, 0);
    scene.add(bottomLight);
    lightingSystem.directionalLights.push(bottomLight);

    // Store original panel light intensities
    lightingSystem.originalIntensities.panel = [
        0.96, 0.8, 0.64, 0.56, 0.48, // rectLights 1-5
        1.2, 0.96, 1.2, 0.96, // front and back panels
        1.12, 0.88, 1.12, 0.88, // left and right panels  
        1.44, 1.2, // top panels
        0.8, 0.64 // bottom panels
    ];
    
    // Add bottom directional light intensity
    lightingSystem.originalIntensities.directional.push(1.2);
    scene.add(bottomLight.target);

    // Store original panel light intensities
    lightingSystem.originalIntensities.panel = [
        0.96, 0.8, 0.64, 0.56, 0.48, // rectLights 1-5
        1.2, 0.96, 1.2, 0.96, // front and back panels
        1.12, 0.88, 1.12, 0.88, // left and right panels  
        1.44, 1.2, // top panels
        0.8, 0.64 // bottom panels
    ];
    
    // Add bottom directional light intensity
    lightingSystem.originalIntensities.directional.push(1.2);
    scene.add(bottomLight.target);

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
    
    partsButtons.innerHTML = '';
    
    // Create buttons for models
    MODELS.forEach((modelInfo, idx) => {
        const btn = document.createElement('button');
        btn.className = 'part-btn';
        btn.dataset.model = modelInfo.name;
        btn.textContent = modelInfo.displayName;
        partsButtons.appendChild(btn);
    });    // Load first model by default with lazy loading
    if (MODELS.length > 0) {
        // Mark first button as selected
        const firstBtn = partsButtons.querySelector('.part-btn');
        if (firstBtn) firstBtn.classList.add('selected');
        
        // Load model immediately for better performance
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

    console.log(`Loading model: ${modelPath}`);

    // Clear existing models
    loadedModels.forEach(model => scene.remove(model));
    loadedModels = [];    loader.load(
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
                        
                        // Preserve original material properties
                        if (material.color) {
                            material.color.convertSRGBToLinear(); // Ensure color is in linear space
                        }
                        if (material.emissive) {
                            material.emissive.convertSRGBToLinear();
                        }
                        
                        // Force material update
                        material.needsUpdate = true;
                    });
                }            });

            // Apply model-specific scaling based on individual model needs
            let scale = 1; // Default scale
            
            // Individual scaling for each cell model
            if (modelName === 'animal_cell_-_downloadable.glb') {
                scale = 1.5; // Slightly smaller for animal cell
            } else if (modelName === 'human_cell.glb') {
                scale = 4.5; // Larger for human cell
            } else if (modelName === 'plant_cell_organelles.glb') {
                scale = 0.025; // Smaller for plant cell organelles to show detail
            }
            
            model.scale.setScalar(scale);

            // Center model at origin
            const box = new THREE.Box3().setFromObject(model);
            const center = new THREE.Vector3();
            box.getCenter(center);
            model.position.sub(center);            scene.add(model);
            loadedModels.push(model);

            // Apply model-specific lighting adjustments
            adjustLightingForModel(modelName);

            // Only log in debug mode to improve performance
            if (window.location.search.includes('debug=true')) {
                console.log(`Model ${modelName} loaded successfully`);
            }

            // Adjust lighting for the loaded model
            adjustLightingForModel(modelName);
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
// LIGHTING ADJUSTMENT FUNCTIONS
// =============================================================================

// Function to adjust lighting intensity for specific models
function adjustLightingForModel(modelName) {
    if (modelName === 'plant_cell_organelles.glb') {
        // Reduce all lights by 50% for plant cell model
        applyLightingScale(0.5);
    } else {
        // Restore original lighting for other models
        applyLightingScale(1.0);
    }
}

// Function to apply lighting scale to all lights
function applyLightingScale(scale) {
    // Adjust ambient light
    if (lightingSystem.ambientLight) {
        lightingSystem.ambientLight.intensity = lightingSystem.originalIntensities.ambient * scale;
    }
    
    // Adjust directional lights
    lightingSystem.directionalLights.forEach((light, index) => {
        if (lightingSystem.originalIntensities.directional[index] !== undefined) {
            light.intensity = lightingSystem.originalIntensities.directional[index] * scale;
        }
    });
    
    // Adjust panel lights
    lightingSystem.panelLights.forEach((light, index) => {
        if (lightingSystem.originalIntensities.panel[index] !== undefined) {
            light.intensity = lightingSystem.originalIntensities.panel[index] * scale;
        }
    });
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

