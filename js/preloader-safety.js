/**
 * Emergency Fallback Handler for Simenium Preloader
 * Handles edge cases and provides graceful degradation
 */

class PreloaderSafetyNet {
    constructor() {
        this.setupEmergencyHandlers();
        this.monitorPreloaderHealth();
    }

    setupEmergencyHandlers() {
        // Catch any unhandled Promise rejections from preloader
        window.addEventListener('unhandledrejection', (event) => {
            if (this.isPreloaderError(event.reason)) {
                console.warn('[Safety] Handled preloader error:', event.reason);
                event.preventDefault(); // Prevent default error handling
                this.disablePreloader();
            }
        });

        // Catch any unhandled errors from preloader
        window.addEventListener('error', (event) => {
            if (this.isPreloaderError(event.error)) {
                console.warn('[Safety] Handled preloader error:', event.error);
                this.disablePreloader();
            }
        });

        // Monitor for quota exceeded errors (storage)
        window.addEventListener('quotaexceeded', () => {
            console.warn('[Safety] Storage quota exceeded, disabling preloader');
            this.disablePreloader();
        });

        // Handle offline/online status
        window.addEventListener('offline', () => {
            console.log('[Safety] Going offline, pausing preloader');
            this.pausePreloader();
        });

        window.addEventListener('online', () => {
            console.log('[Safety] Back online, resuming preloader');
            this.resumePreloader();
        });
    }

    isPreloaderError(error) {
        if (!error) return false;
        
        const errorString = error.toString().toLowerCase();
        return errorString.includes('preloader') || 
               errorString.includes('service worker') ||
               errorString.includes('smart-preloader') ||
               errorString.includes('viewer-preloader');
    }

    disablePreloader() {
        try {
            if (window.SmartPreloader) {
                window.SmartPreloader.shouldPreload = false;
                window.SmartPreloader.isPreloading = false;
                console.log('[Safety] Preloader disabled safely');
            }
        } catch (e) {
            console.warn('[Safety] Could not disable preloader:', e);
        }
    }

    pausePreloader() {
        try {
            if (window.SmartPreloader) {
                window.SmartPreloader.isPreloading = false;
                console.log('[Safety] Preloader paused');
            }
        } catch (e) {
            console.warn('[Safety] Could not pause preloader:', e);
        }
    }

    resumePreloader() {
        try {
            if (window.SmartPreloader && window.SmartPreloader.shouldPreload && navigator.onLine) {
                window.SmartPreloader.isPreloading = true;
                console.log('[Safety] Preloader resumed');
            }
        } catch (e) {
            console.warn('[Safety] Could not resume preloader:', e);
        }
    }

    monitorPreloaderHealth() {
        // Check preloader health every 30 seconds
        setInterval(() => {
            this.healthCheck();
        }, 30000);
    }

    healthCheck() {
        try {
            if (window.SmartPreloader) {
                const status = window.SmartPreloader.getPreloadStatus();
                if (status.queueLength > 50) {
                    console.warn('[Safety] Preloader queue too large, clearing...');
                    window.SmartPreloader.preloadQueue = [];
                }
            }
        } catch (e) {
            console.warn('[Safety] Health check failed:', e);
        }
    }

    // Provide fallback methods for viewer-preloader
    static createFallbackPreloader() {
        return {
            isModelLoaded: () => false,
            loadCurrentModel: () => Promise.resolve(false),
            forcePreloadModel: () => {},
            getPreloadStatus: () => ({
                isPreloading: false,
                loadedModels: [],
                queueLength: 0,
                priorityQueueLength: 0,
                networkSpeed: 'unknown',
                shouldPreload: false
            })
        };
    }
}

// Initialize safety net
const preloaderSafetyNet = new PreloaderSafetyNet();

// Provide fallback for SmartPreloader if it fails to load
setTimeout(() => {
    if (!window.SmartPreloader) {
        console.warn('[Safety] SmartPreloader not available, creating fallback');
        window.SmartPreloader = PreloaderSafetyNet.createFallbackPreloader();
    }
}, 3000);

// Export for debugging
window.PreloaderSafetyNet = preloaderSafetyNet;
