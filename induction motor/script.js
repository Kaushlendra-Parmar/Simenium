/**
 * 3D Model Viewer - Auto Setup from locations.json
 * 
 * SIMPLE SETUP: Just add your models to ./models/locations.json and everything works automatically!
 * 
 * The system will:
 * 1. Read model list from locations.json
 * 2. Auto-create buttons for each model
 * 3. Auto-connect 'to' and 'from' positions
 * 4. Handle all animations automatically
 * 
 * To add a new model:
 * 1. Put the .glb file in ./models/ folder
 * 2. Add entry to locations.json with "name", "from", and "to" coordinates
 * 3. Refresh - button appears automatically!
 */

// =============================================================================
// CONFIGURATION: Change these paths when using as subfolder
// =============================================================================
const CONFIG = {
    // Models folder path - change this when embedding as subfolder
    modelsPath: './models',          // Default: './models'
    // Examples for subfolder usage:
    // modelsPath: './3d-viewer/models',     // If this viewer is in 3d-viewer subfolder
    // modelsPath: './assets/3d-models',     // If models are in assets/3d-models
    // modelsPath: '../shared/models',       // If models are in parent/shared folder
    
    // Locations file path
    get locationsPath() { return `${this.modelsPath}/locations.json`; }
};
// =============================================================================

let scene, camera, renderer, controls;
let loadedModels = [];
let modelLocations = {}; // Store locations for each model

// Load model locations from JSON file
async function loadModelLocations() {
    try {
        console.log('Loading locations from:', CONFIG.locationsPath);
        // Use explicit relative path to ensure it loads from this subfolder's models directory
        const response = await fetch(CONFIG.locationsPath, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('Raw JSON response:', text.substring(0, 200) + '...');
        
        let locations;
        try {
            locations = JSON.parse(text);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Invalid JSON content:', text);
            throw new Error(`Invalid JSON in locations.json: ${parseError.message}`);
        }
        
        console.log('Loaded locations:', locations);
        
        if (!Array.isArray(locations)) {
            throw new Error('locations.json must contain an array of objects');
        }
        
        locations.forEach((location, index) => {
            if (!location.name || !location.from || !location.to) {
                console.error(`Invalid location object at index ${index}:`, location);
                return;
            }
            modelLocations[location.name] = {
                from: { x: location.from[0], y: location.from[1], z: location.from[2] },
                to: { x: location.to[0], y: location.to[1], z: location.to[2] }
            };
        });
        console.log('Model locations:', modelLocations);    } catch (error) {
        console.error('Error loading locations.json:', error);
        console.error('Make sure the path is correct:', CONFIG.locationsPath);
        console.error('Current CONFIG.modelsPath:', CONFIG.modelsPath);
        
        // Fallback: Use hardcoded locations if JSON fails to load
        console.warn('Using fallback hardcoded locations...');
        modelLocations = {
            'stator.glb': {
                from: { x: 0, y: 0.515, z: 0.607 },
                to: { x: 0, y: 0.515, z: 0.515 }
            },
            'rotar.glb': {
                from: { x: 0.588, y: -3.58, z: 0.515 },
                to: { x: 0, y: 0.515, z: 0.515 }
            },
            'torus1.glb': {
                from: { x: 3.101, y: 0.381, z: 0.492 },
                to: { x: 0.082, y: 0.381, z: 0.492 }
            },
            'torus2.glb': {
                from: { x: -1.345, y: -1.449, z: 0.637 },
                to: { x: 0.035, y: 0.552, z: 0.649 }
            },
            'torus3.glb': {
                from: { x: -1.74, y: -0.53, z: 1.762 },
                to: { x: -0.171, y: 0.493, z: 0.627 }
            }
        };
        console.log('Fallback model locations loaded:', modelLocations);
    }
}

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
    renderer.setPixelRatio(window.devicePixelRatio);

    // Enhanced color accuracy settings to match Blender
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.LinearToneMapping; // Changed from ACESFilmic for better color accuracy
    renderer.toneMappingExposure = 1.0;
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;    // OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = true;
    
    // Lighting - Multi-directional lighting setup for better coverage (same as Insulators)
    const ambientLight = new THREE.AmbientLight(0xffffff, 3.0);
    scene.add(ambientLight);

    // Primary directional lights from different angles
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 3.5);
    directionalLight1.position.set(10, 20, 10);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight2.position.set(-10, 10, -10);
    scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight3.position.set(0, 15, -15);
    scene.add(directionalLight3);

    const directionalLight4 = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight4.position.set(-15, 5, 0);
    scene.add(directionalLight4);

    const directionalLight5 = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight5.position.set(15, 8, -5);
    scene.add(directionalLight5);

    // Panel lights from multiple directions for even softer illumination
    const rectLight1 = new THREE.RectAreaLight(0xffffff, 1.2, 8, 8);
    rectLight1.position.set(0, 12, 0);
    rectLight1.lookAt(0, 0, 0);
    scene.add(rectLight1);

    const rectLight2 = new THREE.RectAreaLight(0xffffff, 1.0, 6, 6);
    rectLight2.position.set(8, 5, 8);
    rectLight2.lookAt(0, 0, 0);
    scene.add(rectLight2);

    const rectLight3 = new THREE.RectAreaLight(0xffffff, 0.8, 6, 6);
    rectLight3.position.set(-8, 5, -8);
    rectLight3.lookAt(0, 0, 0);
    scene.add(rectLight3);

    const rectLight4 = new THREE.RectAreaLight(0xffffff, 0.7, 5, 5);
    rectLight4.position.set(0, 3, 10);
    rectLight4.lookAt(0, 0, 0);
    scene.add(rectLight4);    const rectLight5 = new THREE.RectAreaLight(0xffffff, 0.6, 5, 5);
    rectLight5.position.set(0, 3, -10);
    rectLight5.lookAt(0, 0, 0);
    scene.add(rectLight5);

    // Bottom light for under-illumination
    const bottomLight = new THREE.DirectionalLight(0xffffff, 1.5);
    bottomLight.position.set(0, -10, 0);
    bottomLight.target.position.set(0, 0, 0);
    scene.add(bottomLight);
    scene.add(bottomLight.target);

    // Window resize handler
    window.addEventListener('resize', onWindowResize, false);
}

// AUTO SETUP: Model locations are automatically read from locations.json
// Just add your models to locations.json and they will appear automatically!
function setupModelButtons() {    // Get model list from the loaded locations.json data
    const glbFiles = Object.keys(modelLocations).map(name => name);
    
    if (glbFiles.length === 0) {
        console.warn('No models found in locations.json');
        return;
    }
    
    console.log('Auto-detected models:', glbFiles);
    
    const partsButtons = document.getElementById('parts-buttons');
    if (!partsButtons) {
        console.error('parts-buttons element not found');
        return;
    }
    
    partsButtons.innerHTML = '';
    
    // Separate torus models from other models
    const torusModels = glbFiles.filter(fileName => fileName.includes('torus'));
    const otherModels = glbFiles.filter(fileName => !fileName.includes('torus'));
    
    // Create buttons for non-torus models
    otherModels.forEach((fileName, idx) => {
        const btn = document.createElement('button');
        btn.className = 'part-btn';
        btn.dataset.model = fileName;
        // Extract display name without extension
        const displayName = fileName.replace(/\.[^.]*$/, '');
        btn.textContent = displayName;
        partsButtons.appendChild(btn);
    });
    
    // Create single "winding" button for all torus models
    if (torusModels.length > 0) {
        const windingBtn = document.createElement('button');
        windingBtn.className = 'part-btn';
        windingBtn.dataset.model = 'winding';
        windingBtn.textContent = 'winding';
        partsButtons.appendChild(windingBtn);
    }
      // On first load, show all models at their 'to' positions (auto-connected from locations.json) with lazy loading
    setTimeout(() => {
        glbFiles.forEach((fileName) => {
            const locations = modelLocations[fileName];
            const to = locations ? locations.to : { x: 0, y: 0, z: 0 };
            loadModel(fileName, { animateFrom: to });
        });
    }, 100); // Small delay to allow UI to render first
    
    // Attach event listeners for new buttons
    document.querySelectorAll('.part-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const isMultiple = document.getElementById('multiple-toggle').checked;
            const modelName = button.dataset.model;
            
            if (modelName === 'winding') {
                // Handle winding button specially
                handleWindingToggle(button, isMultiple);
            } else {
                // Handle regular model buttons
                if (!isMultiple) {
                    document.querySelectorAll('.part-btn').forEach(btn => btn.classList.remove('selected'));
                    button.classList.add('selected');
                    handleModelSelection(modelName);
                } else {
                    button.classList.toggle('selected');
                    handleMultipleModelToggle(modelName, button.classList.contains('selected'));
                }
            }
        });
    });
}

// Setup UI event handlers
function setupUIHandlers() {
    // Multiple toggle handler
    document.getElementById('multiple-toggle').addEventListener('change', (e) => {
        if (e.target.checked) {
            // Multiple mode turned ON: animate all currently loaded models to their 'to' location
            loadedModels.forEach(model => {
                // model.name is already the filename from locations.json
                const locations = modelLocations[model.name];
                const to = locations ? locations.to : { x: 0, y: 0, z: 0 };
                gsap.to(model.position, {
                    x: to.x, y: to.y, z: to.z, duration: 1, ease: 'power2.inOut'
                });
            });
        } else {
            // Deselect all on toggle off
            document.querySelectorAll('.part-btn').forEach(btn => btn.classList.remove('selected'));
            // Remove all models
            loadedModels.forEach(model => scene.remove(model));
            loadedModels = [];
        }
    });    // Zoom controls
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

// Handles model selection for single mode
function handleModelSelection(modelName) {
    loadedModels.forEach(model => scene.remove(model));
    loadedModels = [];
    
    if (modelName === 'winding') {
        // Load all torus models
        const torusModels = Object.keys(modelLocations).filter(name => name.includes('torus'));
        torusModels.forEach(torusName => {
            loadModel(torusName, { animateFrom: null });
        });
    } else {
        loadModel(modelName, { animateFrom: null });
    }
}

// Handles add/remove for multiple mode
function handleMultipleModelToggle(modelName, isSelected) {
    if (isSelected) {
        // Add model if not present
        if (!loadedModels.some(m => m.name === modelName)) {
            // modelName is already the filename from locations.json
            const locations = modelLocations[modelName];
            const animateFrom = locations ? locations.from : { x: 0, y: 5, z: 10 };
            loadModel(modelName, { animateFrom: animateFrom, animateTo: locations ? locations.to : null });
        }
    } else {
        // Remove model
        for (let i = loadedModels.length - 1; i >= 0; i--) {
            if (loadedModels[i].name === modelName) {
                scene.remove(loadedModels[i]);
                loadedModels.splice(i, 1);
                break;
            }
        }
    }
}

// Load and display a 3D model
function loadModel(modelName, options = {}) {
    const loader = new THREE.GLTFLoader();
    // modelName is already the filename from locations.json (e.g., "a.glb")
    const modelPath = `${CONFIG.modelsPath}/${modelName}`;
    const animateFrom = options.animateFrom || null;
    const animateTo = options.animateTo || null;    loader.load(
        modelPath,
        (gltf) => {
            const model = gltf.scene;
            model.name = modelName;

            // Preserve materials and colors from Blender
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    // Handle both single materials and material arrays
                    const materials = Array.isArray(child.material) ? child.material : [child.material];
                    
                    materials.forEach(material => {
                        // Ensure proper color space for all texture types
                        if (material.map) {
                            material.map.encoding = THREE.sRGBEncoding;
                            material.map.flipY = false;
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
                        
                        // Force material update
                        material.needsUpdate = true;
                    });
                }
            });

            // Compute bounding box to fit model to screen
            const box = new THREE.Box3().setFromObject(model);
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const camDist = camera.position.length();
            const fov = camera.fov * (Math.PI / 180);
            const desiredScreenFrac = 0.5;
            const visibleHeight = 2 * Math.tan(fov / 2) * camDist;            const targetSize = visibleHeight * desiredScreenFrac;
            let scale = targetSize / maxDim;
            scale = scale * 0.7; // Scale factor adjustment - reduced by 30%

            // Apply current global zoom factor to new model
            if (loadedModels.length > 0) {
                const avgScale = loadedModels.reduce((sum, m) => sum + m.scale.x, 0) / loadedModels.length;
                const zoomFactor = avgScale / scale;
                scale = scale * zoomFactor;
            }
            model.scale.setScalar(scale);

            // Center model at origin
            const center = new THREE.Vector3();
            box.getCenter(center);
            model.position.sub(center);

            // Set position based on animateFrom option
            if (animateFrom) {
                model.position.set(animateFrom.x, animateFrom.y, animateFrom.z);
            }

            scene.add(model);
            loadedModels.push(model);

            // Animate to 'to' position if specified
            if (animateTo) {
                gsap.to(model.position, {
                    x: animateTo.x, 
                    y: animateTo.y, 
                    z: animateTo.z, 
                    duration: 1.5, 
                    ease: 'power2.inOut',
                    delay: 0.2 // Small delay to see the starting position
                });
            }

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

// Animate zooming the model in/out
function animateModelZoom(factor) {
    if (loadedModels.length === 0) return;
    const current = { scale: loadedModels[0].scale.x };
    const target = { scale: loadedModels[0].scale.x * factor };
    gsap.to(current, {
        scale: target.scale,
        duration: 0.5,
        ease: 'power2.inOut',
        onUpdate: () => {
            loadedModels.forEach(model => {
                model.scale.setScalar(current.scale);
            });
        }
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

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

// Initialize pen functionality
function initPenFeatures() {
    // Create pen canvas overlay
    penCanvas = document.createElement('canvas');
    penCanvas.id = 'pen-canvas';    penCanvas.style.cssText = `
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
    resizePenCanvas();    // Pen button toggle
    const penBtn = document.getElementById('pen-btn');
    if (penBtn) {
        // Remove any existing event listeners by cloning the button
        const newPenBtn = penBtn.cloneNode(true);
        penBtn.parentNode.replaceChild(newPenBtn, penBtn);
        
        newPenBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Pen button clicked, penMode was:', penMode);
            console.log('Button classes before toggle:', newPenBtn.className);
            
            penMode = !penMode;
            
            if (penMode) {
                newPenBtn.classList.add('selected');
                enablePen();
            } else {
                newPenBtn.classList.remove('selected');
                disablePen();
            }
            
            console.log('Pen mode is now:', penMode);
            console.log('Button classes after toggle:', newPenBtn.className);
        });
        
        // Also handle mousedown/mouseup to prevent CSS :active interference
        newPenBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });
        
        newPenBtn.addEventListener('mouseup', (e) => {
            e.preventDefault();
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
    console.log('Pen canvas display:', penCanvas.style.display);
    console.log('Pen canvas pointer events:', penCanvas.style.pointerEvents);
    
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
    console.log('Pen pointer down');
    drawing = true;
    const rect = penCanvas.getBoundingClientRect();
    lastPoint = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
    console.log('Starting draw at:', lastPoint);
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
    console.log('Pen pointer up');
    drawing = false;
    lastPoint = null;
}

function resizePenCanvas() {
    if (!penCanvas) return;
    // Save current drawing
    const img = penCtx.getImageData(0, 0, penCanvas.width, penCanvas.height);
    penCanvas.width = window.innerWidth;
    penCanvas.height = window.innerHeight;
    penCtx.putImageData(img, 0, 0);
}

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

    if (!settingsBtn || !settingsPopup) return;    settingsBtn.addEventListener('click', (e) => {
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
            console.log('Settings opened, enabling pen mode');
            penMode = true;
            const penBtn = document.getElementById('pen-btn');
            if (penBtn) penBtn.classList.add('selected');
            enablePen();
        }
    });// Tool selection
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

// ===============================

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing 3D Viewer...');
    
    // Load model locations first
    await loadModelLocations();
    
    // Initialize Three.js
    initThreeJS();
    
    // Setup model buttons
    setupModelButtons();
    
    // Setup UI handlers
    setupUIHandlers();
    
    // Initialize pen features
    initPenFeatures();
    
    // Initialize settings features
    initSettingsFeatures();
    
    // Start animation loop
    animate();
    
    console.log('3D Viewer initialized successfully');
});

// Handles winding button toggle (controls all torus models)
function handleWindingToggle(button, isMultiple) {
    const torusModels = Object.keys(modelLocations).filter(name => name.includes('torus'));
    const isSelected = button.classList.contains('selected');
    
    if (!isMultiple) {
        // Single mode: clear other selections and load/unload all torus models
        document.querySelectorAll('.part-btn').forEach(btn => btn.classList.remove('selected'));
        
        if (!isSelected) {
            // Load all torus models
            button.classList.add('selected');
            loadedModels.forEach(model => scene.remove(model));
            loadedModels = [];
            
            torusModels.forEach(modelName => {
                loadModel(modelName, { animateFrom: null });
            });
        }
    } else {
        // Multiple mode: toggle all torus models
        button.classList.toggle('selected');
        const nowSelected = button.classList.contains('selected');
        
        if (nowSelected) {
            // Add all torus models that aren't already loaded
            torusModels.forEach(modelName => {
                if (!loadedModels.some(m => m.name === modelName)) {
                    const locations = modelLocations[modelName];
                    const animateFrom = locations ? locations.from : { x: 0, y: 5, z: 10 };
                    loadModel(modelName, { animateFrom: animateFrom, animateTo: locations ? locations.to : null });
                }
            });
        } else {
            // Remove all torus models
            for (let i = loadedModels.length - 1; i >= 0; i--) {
                if (torusModels.includes(loadedModels[i].name)) {
                    scene.remove(loadedModels[i]);
                    loadedModels.splice(i, 1);
                }
            }
        }
    }
}


