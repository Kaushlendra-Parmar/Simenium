/**
 * Service Worker for Simenium 3D Model Preloading and Caching
 * Handles background model loading and caching for optimal performance
 */

const CACHE_NAME = 'simenium-models-v1';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Model file extensions to cache
const MODEL_EXTENSIONS = ['.glb', '.gltf'];

// Priority models (in order of homepage cards) - VERIFIED PATHS
const PRIORITY_MODELS = [
    'atom/models/atom.glb',
    'solar system/models/solar_system.glb',
    'water cycle/models/water_cycle.glb',
    'cells/models/human_cell.glb',
    'cells/models/plant_cell_organelles.glb',
    'cells/models/animal_cell_-_downloadable.glb',
    'dna & rna/models/dna.glb',
    'dna & rna/models/rna.glb',
    'neuron/models/neuron.glb',
    'digestive system/models/digestive_organs.glb',
    'transformer/models/high_voltage_power_transformer.glb',
    'dc motor/models/model_of_dc_motor_working_principle.glb',
    'induction motor/models/rotar.glb',
    'induction motor/models/stator.glb',
    'induction motor/models/torus1.glb',
    'induction motor/models/torus2.glb', 
    'induction motor/models/torus3.glb',
    'galvanometer/models/moving_coil_galvanometer.glb',
    'multimeter/models/multimeter.glb',
    'Insulators/models/Pin Insulator.glb',
    'Insulators/models/Suspension Insulator.glb'
];

// Install event - setup cache
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker for model caching');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Cache opened');
            return cache;
        })
    );
    self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - handle model requests
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Only handle model files
    if (MODEL_EXTENSIONS.some(ext => url.pathname.endsWith(ext))) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                if (response) {
                    // Check if cache is expired
                    const cachedTime = response.headers.get('sw-cached-time');
                    if (cachedTime) {
                        const ageInMs = Date.now() - parseInt(cachedTime);
                        if (ageInMs < CACHE_EXPIRY) {
                            console.log('[SW] Serving from cache:', url.pathname);
                            return response;
                        }
                    }
                }
                
                // Fetch from network and cache
                console.log('[SW] Fetching from network:', url.pathname);
                return fetch(event.request).then((response) => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        console.warn('[SW] Failed to fetch:', url.pathname, 'Status:', response?.status);
                        return response;
                    }
                    
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME).then((cache) => {
                        // Add timestamp header before caching
                        const headers = new Headers(responseToCache.headers);
                        headers.set('sw-cached-time', Date.now().toString());
                        
                        const modifiedResponse = new Response(responseToCache.body, {
                            status: responseToCache.status,
                            statusText: responseToCache.statusText,
                            headers: headers
                        });
                        
                        cache.put(event.request, modifiedResponse);
                        console.log('[SW] Cached:', url.pathname);
                    });
                    
                    return response;
                }).catch((error) => {
                    console.error('[SW] Network fetch failed:', url.pathname, error);
                    // Return a failed response instead of throwing
                    return new Response('Network error', { 
                        status: 408, 
                        statusText: 'Network Timeout' 
                    });
                });
            })
        );
    }
});

// Handle preload requests from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PRELOAD_MODEL') {
        const modelUrl = event.data.url;
        console.log('[SW] Preloading model:', modelUrl);
        
        // Check if already cached
        caches.match(modelUrl).then((response) => {
            if (!response) {
                // Not cached, fetch and cache
                fetch(modelUrl).then((response) => {
                    if (response && response.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            const headers = new Headers(response.headers);
                            headers.set('sw-cached-time', Date.now().toString());
                            
                            const cachedResponse = new Response(response.body, {
                                status: response.status,
                                statusText: response.statusText,
                                headers: headers
                            });
                            
                            cache.put(modelUrl, cachedResponse);
                            console.log('[SW] Preloaded and cached:', modelUrl);
                            
                            // Notify main thread
                            event.ports[0].postMessage({
                                type: 'PRELOAD_COMPLETE',
                                url: modelUrl,
                                success: true
                            });
                        });
                    }
                }).catch((error) => {
                    console.error('[SW] Preload failed:', modelUrl, error);
                    event.ports[0].postMessage({
                        type: 'PRELOAD_COMPLETE',
                        url: modelUrl,
                        success: false,
                        error: error.message
                    });
                });
            } else {
                console.log('[SW] Model already cached:', modelUrl);
                event.ports[0].postMessage({
                    type: 'PRELOAD_COMPLETE',
                    url: modelUrl,
                    success: true,
                    cached: true
                });
            }
        });
    }
    
    if (event.data && event.data.type === 'GET_CACHE_STATUS') {
        caches.open(CACHE_NAME).then((cache) => {
            return cache.keys();
        }).then((keys) => {
            const cachedModels = keys.map(request => request.url);
            event.ports[0].postMessage({
                type: 'CACHE_STATUS',
                cachedModels: cachedModels,
                totalModels: PRIORITY_MODELS.length
            });
        });
    }
});
