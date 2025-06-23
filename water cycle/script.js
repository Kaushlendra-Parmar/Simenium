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
    { name: 'water_cycle.glb', displayName: 'Water Cycle Model' }
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
    renderer.setPixelRatio(window.devicePixelRatio);    // Enhanced color accuracy settings for proper sun and cloud colors
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.LinearToneMapping; // Better color preservation
    renderer.toneMappingExposure = 0.8; // Reduced exposure for more accurate colors
    renderer.physicallyCorrectLights = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;    controls.dampingFactor = 0.05;    controls.enablePan = true;    // Lighting - Multi-directional lighting setup for better coverage (other lights increased by 3x)
    const ambientLight = new THREE.AmbientLight(0xffffff, 3.375);
    scene.add(ambientLight);    // Primary directional lights from different angles
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 3.9375);
    directionalLight1.position.set(10, 20, 10);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 2.8125);
    directionalLight2.position.set(-10, 10, -10);
    scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 2.25);
    directionalLight3.position.set(0, 15, -15);
    scene.add(directionalLight3);

    const directionalLight4 = new THREE.DirectionalLight(0xffffff, 2.025);
    directionalLight4.position.set(-15, 5, 0);
    scene.add(directionalLight4);

    const directionalLight5 = new THREE.DirectionalLight(0xffffff, 1.6875);
    directionalLight5.position.set(15, 8, -5);
    scene.add(directionalLight5);    // Panel lights from multiple directions for even softer illumination (other lights increased by 3x, top light reduced by 50%)
    const rectLight1 = new THREE.RectAreaLight(0xffffff, 0.225, 8, 8);
    rectLight1.position.set(0, 12, 0);
    rectLight1.lookAt(0, 0, 0);
    scene.add(rectLight1);

    const rectLight2 = new THREE.RectAreaLight(0xffffff, 1.125, 6, 6);
    rectLight2.position.set(8, 5, 8);
    rectLight2.lookAt(0, 0, 0);
    scene.add(rectLight2);

    const rectLight3 = new THREE.RectAreaLight(0xffffff, 0.9, 6, 6);
    rectLight3.position.set(-8, 5, -8);
    rectLight3.lookAt(0, 0, 0);
    scene.add(rectLight3);

    const rectLight4 = new THREE.RectAreaLight(0xffffff, 0.7875, 5, 5);
    rectLight4.position.set(0, 3, 10);
    rectLight4.lookAt(0, 0, 0);
    scene.add(rectLight4);

    const rectLight5 = new THREE.RectAreaLight(0xffffff, 0.675, 5, 5);
    rectLight5.position.set(0, 3, -10);
    rectLight5.lookAt(0, 0, 0);
    scene.add(rectLight5);    // ADDITIONAL PANEL LIGHTS - Six directions systematic coverage (other lights increased by 3x)
    // Front panel lights (additional to existing)
    const frontPanel1 = new THREE.RectAreaLight(0xffffff, 1.6875, 8, 6);
    frontPanel1.position.set(0, 8, 12);
    frontPanel1.lookAt(0, 0, 0);
    scene.add(frontPanel1);

    const frontPanel2 = new THREE.RectAreaLight(0xffffff, 1.35, 6, 4);
    frontPanel2.position.set(0, 2, 10);
    frontPanel2.lookAt(0, 0, 0);
    scene.add(frontPanel2);

    // Back panel lights (additional to existing)
    const backPanel1 = new THREE.RectAreaLight(0xffffff, 1.6875, 8, 6);
    backPanel1.position.set(0, 8, -12);
    backPanel1.lookAt(0, 0, 0);
    scene.add(backPanel1);

    const backPanel2 = new THREE.RectAreaLight(0xffffff, 1.35, 6, 4);
    backPanel2.position.set(0, 2, -10);
    backPanel2.lookAt(0, 0, 0);
    scene.add(backPanel2);

    // Left panel lights
    const leftPanel1 = new THREE.RectAreaLight(0xffffff, 1.575, 6, 8);
    leftPanel1.position.set(-12, 8, 0);
    leftPanel1.lookAt(0, 0, 0);
    scene.add(leftPanel1);

    const leftPanel2 = new THREE.RectAreaLight(0xffffff, 1.2375, 4, 6);
    leftPanel2.position.set(-10, 2, 0);
    leftPanel2.lookAt(0, 0, 0);
    scene.add(leftPanel2);

    // Right panel lights
    const rightPanel1 = new THREE.RectAreaLight(0xffffff, 1.575, 6, 8);
    rightPanel1.position.set(12, 8, 0);
    rightPanel1.lookAt(0, 0, 0);
    scene.add(rightPanel1);

    const rightPanel2 = new THREE.RectAreaLight(0xffffff, 1.2375, 4, 6);
    rightPanel2.position.set(10, 2, 0);
    rightPanel2.lookAt(0, 0, 0);
    scene.add(rightPanel2);    // Top panel lights (top lights reduced by 50%)
    const topPanel1 = new THREE.RectAreaLight(0xffffff, 0.3375, 10, 10);
    topPanel1.position.set(0, 15, 0);
    topPanel1.lookAt(0, 0, 0);
    scene.add(topPanel1);

    const topPanel2 = new THREE.RectAreaLight(0xffffff, 0.28125, 8, 8);
    topPanel2.position.set(0, 12, 0);
    topPanel2.lookAt(0, 0, 0);
    scene.add(topPanel2);    // Bottom panel lights (to complement existing bottom directional light) (increased by 3x)
    const bottomPanel1 = new THREE.RectAreaLight(0xffffff, 1.125, 8, 8);
    bottomPanel1.position.set(0, -5, 0);
    bottomPanel1.lookAt(0, 0, 0);
    scene.add(bottomPanel1);

    const bottomPanel2 = new THREE.RectAreaLight(0xffffff, 0.9, 6, 6);
    bottomPanel2.position.set(0, -3, 0);
    bottomPanel2.lookAt(0, 0, 0);
    scene.add(bottomPanel2);

    // Bottom light for under-illumination
    const bottomLight = new THREE.DirectionalLight(0xffffff, 1.6875);
    bottomLight.position.set(0, -10, 0);
    bottomLight.target.position.set(0, 0, 0);
    scene.add(bottomLight);
    scene.add(bottomLight.target);    // Additional point lights for water elements and other model parts (increased by 3x)
    // Sun point light - positioned where the sun would be in the model
    const sunLight = new THREE.PointLight(0xfff4e6, 5.4, 40, 2);
    sunLight.position.set(8, 15, 6); // Adjust position based on where sun is in your model
    scene.add(sunLight);    // Water area lights - positioned to illuminate water elements specifically (reduced by 75% total)
    const waterLight1 = new THREE.PointLight(0xadd8e6, 0.1, 25, 2); // Light blue for water
    waterLight1.position.set(-5, 8, 3); // Position for water bodies
    scene.add(waterLight1);

    const waterLight2 = new THREE.PointLight(0xadd8e6, 0.675, 20, 2); // Light blue for water
    waterLight2.position.set(3, 6, -4); // Another water area
    scene.add(waterLight2);

    const waterLight3 = new THREE.PointLight(0xadd8e6, 0.7875, 22, 2); // Light blue for water
    waterLight3.position.set(-2, 4, 8); // Third water area
    scene.add(waterLight3);

    // Ground/terrain illumination lights
    const groundLight1 = new THREE.PointLight(0xffffff, 2.25, 30, 2);
    groundLight1.position.set(6, 3, 2); // Illuminate ground elements
    scene.add(groundLight1);

    const groundLight2 = new THREE.PointLight(0xffffff, 1.8, 25, 2);
    groundLight2.position.set(-8, 3, -2); // Another ground area
    scene.add(groundLight2);

    // Cloud area lights - positioned below/around clouds for natural illumination
    const cloudLight1 = new THREE.PointLight(0xffffff, 2.7, 28, 2);
    cloudLight1.position.set(-6, 12, 4); // Adjust based on cloud positions
    scene.add(cloudLight1);

    const cloudLight2 = new THREE.PointLight(0xffffff, 2.25, 25, 2);
    cloudLight2.position.set(2, 14, -5); // Another cloud area
    scene.add(cloudLight2);    // Additional water illumination lights (2x more, reduced by 75% total)
    const waterLight4 = new THREE.PointLight(0xadd8e6, 0.5625, 18, 2); // Light blue for water
    waterLight4.position.set(-7, 5, -2); // Fourth water area
    scene.add(waterLight4);

    const waterLight5 = new THREE.PointLight(0xadd8e6, 0.675, 20, 2); // Light blue for water
    waterLight5.position.set(5, 7, 5); // Fifth water area
    scene.add(waterLight5);

    const waterLight6 = new THREE.PointLight(0xadd8e6, 0.45, 16, 2); // Light blue for water
    waterLight6.position.set(-1, 3, -6); // Sixth water area
    scene.add(waterLight6);

    // Additional ground/terrain lights (2x more, increased by 3x)
    const groundLight3 = new THREE.PointLight(0xffffff, 2.7, 35, 2);
    groundLight3.position.set(-4, 2, 5); // Third ground area
    scene.add(groundLight3);

    const groundLight4 = new THREE.PointLight(0xffffff, 2.25, 28, 2);
    groundLight4.position.set(7, 4, -3); // Fourth ground area
    scene.add(groundLight4);

    const groundLight5 = new THREE.PointLight(0xffffff, 1.8, 22, 2);
    groundLight5.position.set(-6, 1, -7); // Fifth ground area
    scene.add(groundLight5);

    const groundLight6 = new THREE.PointLight(0xffffff, 2.25, 26, 2);
    groundLight6.position.set(3, 2, 7); // Sixth ground area
    scene.add(groundLight6);

    // Additional cloud area lights (2x more, increased by 3x)
    const cloudLight3 = new THREE.PointLight(0xffffff, 1.8, 22, 2);
    cloudLight3.position.set(4, 13, 2); // Third cloud area
    scene.add(cloudLight3);

    const cloudLight4 = new THREE.PointLight(0xffffff, 2.25, 24, 2);
    cloudLight4.position.set(-3, 11, -6); // Fourth cloud area
    scene.add(cloudLight4);

    // Additional sun support lights (2x more for sun area, increased by 3x)
    const sunSupportLight1 = new THREE.PointLight(0xfff4e6, 3.6, 32, 2);
    sunSupportLight1.position.set(6, 13, 8); // Near sun area
    scene.add(sunSupportLight1);

    const sunSupportLight2 = new THREE.PointLight(0xfff4e6, 2.7, 28, 2);
    sunSupportLight2.position.set(10, 17, 4); // Another sun support area
    scene.add(sunSupportLight2);    // Four directional panel lights for enhanced illumination (increased by 3x)
    // Front panel light (Z positive direction)
    const frontDirectionalPanel = new THREE.RectAreaLight(0xffffff, 1.8, 10, 8);
    frontDirectionalPanel.position.set(0, 6, 15);
    frontDirectionalPanel.lookAt(0, 0, 0);
    scene.add(frontDirectionalPanel);

    // Back panel light (Z negative direction)
    const backDirectionalPanel = new THREE.RectAreaLight(0xffffff, 1.8, 10, 8);
    backDirectionalPanel.position.set(0, 6, -15);
    backDirectionalPanel.lookAt(0, 0, 0);
    scene.add(backDirectionalPanel);

    // Left panel light (X negative direction)
    const leftDirectionalPanel = new THREE.RectAreaLight(0xffffff, 1.8, 8, 10);
    leftDirectionalPanel.position.set(-15, 6, 0);
    leftDirectionalPanel.lookAt(0, 0, 0);
    scene.add(leftDirectionalPanel);

    // Right panel light (X positive direction)
    const rightDirectionalPanel = new THREE.RectAreaLight(0xffffff, 1.8, 8, 10);
    rightDirectionalPanel.position.set(15, 6, 0);
    rightDirectionalPanel.lookAt(0, 0, 0);
    scene.add(rightDirectionalPanel);

    // Window resize handler
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Debug function to check scene integrity (only in debug mode)
function debugSceneContents() {
    if (!window.location.search.includes('debug=true')) return;
    
    console.log('=== Scene Debug Info ===');
    console.log(`Total scene children: ${scene.children.length}`);
    console.log(`Loaded models tracked: ${loadedModels.length}`);
    console.log(`Animation mixer active: ${mixer !== null}`);
    console.log(`Animation actions: ${animationActions.length}`);
    console.log(`Is playing: ${isPlaying}`);
    
    // Count different object types
    const objectCounts = {};
    scene.traverse((child) => {
        const type = child.constructor.name;
        objectCounts[type] = (objectCounts[type] || 0) + 1;
    });
    
    console.log('Object types in scene:', objectCounts);
    
    // Check for potential model duplicates in scene
    const modelObjects = [];
    const meshObjects = [];
    scene.traverse((child) => {
        if (child.name && child.name.includes('.glb') && child.parent === scene) {
            modelObjects.push(child.name);
        }
        if (child.isMesh && !child.isLight) {
            meshObjects.push(`${child.name || 'unnamed'} (${child.constructor.name})`);
        }
    });
    
    console.log(`Model objects in scene: ${modelObjects.length}`, modelObjects);
    console.log(`Loaded models array: ${loadedModels.length}`);
    
    if (modelObjects.length > 1 || loadedModels.length > 1) {
        console.warn('⚠️ DUPLICATE MODELS DETECTED!');
        console.warn('Scene model objects:', modelObjects);
        console.warn('LoadedModels array:', loadedModels.map(m => m.name));
    } else {
        console.log('✅ No model duplication detected');
    }
    
    // Check mesh count for animation issues
    const nonLightMeshCount = meshObjects.length;
    if (nonLightMeshCount > 50 && isPlaying) {
        console.warn(`⚠️ High mesh count during animation: ${nonLightMeshCount} meshes`);
    }
    
    console.log('========================');
}

// =============================================================================
// SCENE CLEANUP UTILITIES
// =============================================================================

// Clear all models from scene completely
function clearAllModels() {
    if (window.location.search.includes('debug=true')) {
        console.log(`Clearing scene with ${scene.children.length} objects`);
    }
    
    // Stop and clear animations
    if (mixer) {
        mixer.stopAllAction();
        if (mixer._actions) {
            mixer._actions.forEach(action => {
                if (action._clip) {
                    mixer.uncacheClip(action._clip);
                }
            });
        }
        mixer = null;
    }
    animationActions = [];
    isPlaying = false;
    
    // Remove all loaded models
    loadedModels.forEach(model => {
        // Remove from scene
        scene.remove(model);
        // Dispose of any geometries and materials to prevent memory leaks
        model.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    });
    loadedModels = [];
    
    // MORE AGGRESSIVE CLEANUP: Remove ALL non-light objects from scene
    const childrenToRemove = [];
    scene.children.forEach((child) => {
        // Only keep lights - remove everything else including groups and meshes
        if (!child.isLight && 
            !child.isCamera && 
            !child.isAmbientLight &&
            !child.isDirectionalLight &&
            !child.isPointLight &&
            !child.isRectAreaLight &&
            child.type !== 'DirectionalLightHelper' &&
            child.type !== 'PointLightHelper') {
            childrenToRemove.push(child);
        }
    });
    
    // Remove all identified objects
    childrenToRemove.forEach(obj => {
        console.log(`Removing object of type: ${obj.type}, name: ${obj.name}`);
        scene.remove(obj);
        
        // Dispose of resources
        if (obj.traverse) {
            obj.traverse((child) => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        } else {
            // Direct disposal for non-traversable objects
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(material => material.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        }
    });
    
    if (window.location.search.includes('debug=true')) {
        console.log(`Scene cleaned, now has ${scene.children.length} objects`);
    }
    
    // Force renderer to clear its internal cache
    if (renderer) {
        renderer.renderLists.dispose();
    }
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
    
    if (window.location.search.includes('debug=true')) {
        console.log(`Loading model: ${modelPath}`);
    }

    // Use comprehensive scene cleanup
    clearAllModels();
    
    loader.load(
        modelPath,
        (gltf) => {
            const model = gltf.scene;
            model.name = modelName;            // Enhanced material handling for accurate sun and cloud colors
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    // Handle different material types
                    const materials = Array.isArray(child.material) ? child.material : [child.material];
                    
                    materials.forEach(material => {
                        // Ensure proper color space handling for all texture types
                        if (material.map) {
                            material.map.colorSpace = THREE.SRGBColorSpace;
                            material.map.flipY = false; // Prevent texture flipping issues
                        }
                        if (material.emissiveMap) {
                            material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
                        }
                        if (material.normalMap) {
                            material.normalMap.colorSpace = THREE.NoColorSpace;
                        }
                        if (material.roughnessMap) {
                            material.roughnessMap.colorSpace = THREE.NoColorSpace;
                        }
                        if (material.metalnessMap) {
                            material.metalnessMap.colorSpace = THREE.NoColorSpace;
                        }
                        if (material.aoMap) {
                            material.aoMap.colorSpace = THREE.NoColorSpace;
                        }
                        
                        // Preserve original material properties without conversion
                        // Remove the linear space conversion that was affecting colors
                        
                        // Force material update
                        material.needsUpdate = true;
                    });
                }});// Apply model-specific scaling
            let scale = 2.5; // Default scale
            model.scale.setScalar(scale);

            // Center model at origin
            const box = new THREE.Box3().setFromObject(model);
            const center = new THREE.Vector3();
            box.getCenter(center);
            model.position.sub(center);            
            
            // Ensure this is the only model in the scene before adding
            if (window.location.search.includes('debug=true')) {
                console.log(`About to add model. Scene currently has ${scene.children.length} objects`);
            }
            
            scene.add(model);
            loadedModels.push(model);
            
            if (window.location.search.includes('debug=true')) {
                console.log(`Model added. Scene now has ${scene.children.length} objects`);
            }

            // Setup animations if available
            if (gltf.animations && gltf.animations.length > 0) {
                if (window.location.search.includes('debug=true')) {
                    console.log(`Setting up animations for model...`);
                }
                
                // Stop any existing mixer before creating new one
                if (mixer) {
                    mixer.stopAllAction();
                    mixer = null;
                }
                
                // Create animation mixer
                mixer = new THREE.AnimationMixer(model);
                animationActions = [];
                
                // Add all animations to the mixer
                gltf.animations.forEach((clip) => {
                    const action = mixer.clipAction(clip);
                    animationActions.push(action);
                    action.setLoop(THREE.LoopRepeat);
                    // Set initial state to prevent auto-play
                    action.setEffectiveWeight(1);
                    action.enabled = true;
                });
                
                if (window.location.search.includes('debug=true')) {
                    console.log(`Found ${gltf.animations.length} animation(s) in the model`);
                    console.log(`Scene after animation setup has ${scene.children.length} objects`);
                }
                
                // Show animation controls
                updateAnimationControls();
            } else {
                // Hide animation controls if no animations
                const animationControls = document.getElementById('animation-controls');
                if (animationControls) {
                    animationControls.style.display = 'none';
                }
                // Clear any existing mixer
                if (mixer) {
                    mixer.stopAllAction();
                    mixer = null;
                }
                animationActions = [];
                isPlaying = false;
            }

            if (window.location.search.includes('debug=true')) {
                console.log(`Model ${modelName} loaded successfully`);
            }
            // Remove debug call to improve performance
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
// ANIMATION FUNCTIONALITY
// =============================================================================

// Play animation
function playAnimation() {
    if (mixer && animationActions.length > 0) {
        if (window.location.search.includes('debug=true')) {
            console.log('Starting animation...');
        }
        
        // Ensure we have exactly one model before starting animation
        if (loadedModels.length > 1) {
            if (window.location.search.includes('debug=true')) {
                console.warn('Multiple models detected, cleaning up duplicates...');
            }
            // Keep only the last loaded model (most recent)
            const modelToKeep = loadedModels[loadedModels.length - 1];
            
            // Remove all other models
            for (let i = 0; i < loadedModels.length - 1; i++) {
                const modelToRemove = loadedModels[i];
                scene.remove(modelToRemove);
                
                // Dispose of resources
                modelToRemove.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => material.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            }
            
            // Update loadedModels array to contain only the one model
            loadedModels = [modelToKeep];
        }
        
        // Stop all current actions to prevent conflicts
        mixer.stopAllAction();
        
        // Start animations fresh
        animationActions.forEach(action => {
            action.reset();
            action.setEffectiveWeight(1);
            action.setEffectiveTimeScale(1);
            action.paused = false;
            action.play();
        });
        
        isPlaying = true;
        updateAnimationControls();
        
        if (window.location.search.includes('debug=true')) {
            console.log('Animation started with single model');
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
        // Ensure no duplicate models when resuming
        if (loadedModels.length > 1) {
            if (window.location.search.includes('debug=true')) {
                console.warn('Multiple models detected during resume, cleaning up...');
            }
            const modelToKeep = loadedModels[loadedModels.length - 1];
            
            for (let i = 0; i < loadedModels.length - 1; i++) {
                const modelToRemove = loadedModels[i];
                scene.remove(modelToRemove);
                modelToRemove.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => material.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            }
            loadedModels = [modelToKeep];
        }
        
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

    // Add keyboard shortcut for debugging (Ctrl+D)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            debugSceneContents();
        }
    });
}

// =============================================================================
// ANIMATION LOOP
// =============================================================================

function animate() {
    requestAnimationFrame(animate);
    
    // Safety check: Remove duplicate models if they appear during animation
    if (loadedModels.length > 1) {
        if (window.location.search.includes('debug=true')) {
            console.warn('Duplicate models detected in animation loop, cleaning up...');
        }
        const modelToKeep = loadedModels[loadedModels.length - 1];
        
        for (let i = 0; i < loadedModels.length - 1; i++) {
            const modelToRemove = loadedModels[i];
            scene.remove(modelToRemove);
            
            // Dispose of resources
            modelToRemove.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
        loadedModels = [modelToKeep];
    }
    
    // Update animation mixer with safety checks
    const delta = clock.getDelta();
    if (mixer && mixer._actions && mixer._actions.length > 0) {
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
    
    console.log('3D Water Cycle Viewer initialized successfully');
    
    // Debug shortcut (only in debug mode)
    if (window.location.search.includes('debug=true')) {
        console.log('Press Ctrl+D to debug scene contents');
    }
});

