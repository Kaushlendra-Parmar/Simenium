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
    { name: 'neuron.glb', displayName: 'Neuron Structure' }
];

// =============================================================================
// GLOBAL VARIABLES
// =============================================================================
let scene, camera, renderer, controls;
let loadedModels = [];

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
    renderer.setPixelRatio(window.devicePixelRatio);    // Enhanced color accuracy settings to match Blender exactly
    renderer.outputColorSpace = THREE.SRGBColorSpace; // Updated for newer Three.js
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0; // More neutral exposure for accurate colors
    renderer.useLegacyLights = false; // Ensure physically accurate lighting
    renderer.colorManagement = true; // Enable proper color management
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;    controls.dampingFactor = 0.05;    controls.enablePan = true;    // Simplified lighting setup for dramatic shadows
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Primary directional light with shadows
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(10, 15, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -20;
    mainLight.shadow.camera.right = 20;
    mainLight.shadow.camera.top = 20;
    mainLight.shadow.camera.bottom = -20;
    scene.add(mainLight);

    // Fill light for subtle contrast
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

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
      // Load first model by default with lazy loading
    if (MODELS.length > 0) {
        // Mark first button as selected
        const firstBtn = partsButtons.querySelector('.part-btn');
        if (firstBtn) firstBtn.classList.add('selected');
        
        // Implement lazy loading - defer model loading
        setTimeout(() => {
            loadModel(MODELS[0].name);
        }, 100); // Small delay to allow UI to render first
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
            model.name = modelName;            // Preserve materials and colors from Blender with maximum accuracy
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    // Enable shadows
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Handle different material types
                    const materials = Array.isArray(child.material) ? child.material : [child.material];
                    
                    materials.forEach(material => {
                        // Set proper color space for all texture types
                        if (material.map) {
                            material.map.colorSpace = THREE.SRGBColorSpace;
                            material.map.flipY = false;
                        }
                        if (material.emissiveMap) {
                            material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
                        }
                        if (material.normalMap) {
                            material.normalMap.colorSpace = THREE.LinearSRGBColorSpace;
                        }
                        if (material.roughnessMap) {
                            material.roughnessMap.colorSpace = THREE.LinearSRGBColorSpace;
                        }
                        if (material.metalnessMap) {
                            material.metalnessMap.colorSpace = THREE.LinearSRGBColorSpace;
                        }
                        if (material.aoMap) {
                            material.aoMap.colorSpace = THREE.LinearSRGBColorSpace;
                        }
                        
                        // Preserve material colors exactly as authored in Blender
                        // No color space conversion needed - Three.js handles this automatically
                        // with proper colorSpace settings above
                        
                        // Force material update to apply changes
                        material.needsUpdate = true;
                    });
                }});// Apply model-specific scaling
            let scale = 0.00115; // Default scale
            model.scale.setScalar(scale);

            // Center model at origin
            const box = new THREE.Box3().setFromObject(model);
            const center = new THREE.Vector3();
            box.getCenter(center);
            model.position.sub(center);

            scene.add(model);
            loadedModels.push(model);

            console.log(`Model ${modelName} loaded successfully`);
        },
        (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '% loaded');
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

