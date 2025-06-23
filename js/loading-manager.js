/**
 * Loading State Manager for Simenium
 * Handles loading states, progress tracking, and timeouts
 */

window.SimeniumLoadingManager = {
    loadingElements: new Map(),
    timeouts: new Map(),
    progressTrackers: new Map(),
    
    // Initialize loading manager
    init: function() {
        this.createLoadingStyles();
    },
    
    // Create loading styles
    createLoadingStyles: function() {
        if (document.getElementById('simenium-loading-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'simenium-loading-styles';
        style.textContent = `
            .simenium-loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                color: white;
                font-family: 'DM Sans', sans-serif;
                transition: opacity 0.3s ease;
            }
            
            .simenium-loading-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid rgba(255,255,255,0.3);
                border-top: 3px solid white;
                border-radius: 50%;
                animation: simenium-spin 1s linear infinite;
                margin-bottom: 20px;
            }
            
            .simenium-loading-text {
                font-size: 18px;
                font-weight: 500;
                margin-bottom: 10px;
                text-align: center;
            }
            
            .simenium-loading-subtitle {
                font-size: 14px;
                opacity: 0.8;
                text-align: center;
                max-width: 300px;
                line-height: 1.4;
            }
            
            .simenium-progress-bar {
                width: 200px;
                height: 4px;
                background: rgba(255,255,255,0.3);
                border-radius: 2px;
                margin: 15px 0;
                overflow: hidden;
            }
            
            .simenium-progress-fill {
                height: 100%;
                background: white;
                border-radius: 2px;
                transition: width 0.3s ease;
                width: 0%;
            }
            
            .simenium-loading-error {
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
            }
            
            .simenium-loading-success {
                background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
            }
            
            @keyframes simenium-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .simenium-fade-out {
                opacity: 0;
                transform: scale(0.95);
            }
        `;
        
        document.head.appendChild(style);
    },
    
    // Show loading state
    show: function(containerId, options = {}) {
        const {
            title = 'Loading...',
            subtitle = 'Please wait while we prepare your 3D experience',
            showProgress = false,
            timeout = 30000
        } = options;
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Container "${containerId}" not found for loading state`);
            return;
        }
        
        // Remove existing loading overlay
        this.hide(containerId);
        
        // Create loading overlay
        const overlay = document.createElement('div');
        overlay.className = 'simenium-loading-overlay';
        overlay.innerHTML = `
            <div class="simenium-loading-spinner"></div>
            <div class="simenium-loading-text">${title}</div>
            <div class="simenium-loading-subtitle">${subtitle}</div>
            ${showProgress ? '<div class="simenium-progress-bar"><div class="simenium-progress-fill"></div></div>' : ''}
        `;
        
        container.style.position = 'relative';
        container.appendChild(overlay);
        
        this.loadingElements.set(containerId, overlay);
        
        // Set timeout
        if (timeout > 0) {
            const timeoutId = setTimeout(() => {
                this.showError(containerId, {
                    title: 'Loading Timeout',
                    subtitle: 'The content is taking longer than expected to load. Please check your connection and try again.',
                    showRetry: true
                });
            }, timeout);
            
            this.timeouts.set(containerId, timeoutId);
        }
        
        console.log(`⏳ Loading state shown for "${containerId}"`);
    },
    
    // Update progress
    updateProgress: function(containerId, progress, text) {
        const overlay = this.loadingElements.get(containerId);
        if (!overlay) return;
        
        const progressBar = overlay.querySelector('.simenium-progress-fill');
        const progressText = overlay.querySelector('.simenium-loading-text');
        
        if (progressBar) {
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
        
        if (text && progressText) {
            progressText.textContent = text;
        }
        
        // Store progress
        this.progressTrackers.set(containerId, progress);
    },
    
    // Show error state
    showError: function(containerId, options = {}) {
        const {
            title = 'Loading Failed',
            subtitle = 'Something went wrong while loading the content. Please try again.',
            showRetry = true,
            retryCallback = null
        } = options;
        
        const overlay = this.loadingElements.get(containerId);
        if (!overlay) return;
        
        overlay.className = 'simenium-loading-overlay simenium-loading-error';
        overlay.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
            <div class="simenium-loading-text">${title}</div>
            <div class="simenium-loading-subtitle">${subtitle}</div>
            ${showRetry ? `
                <button onclick="SimeniumLoadingManager.retry('${containerId}')" style="
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    margin-top: 20px;
                    font-family: 'DM Sans', sans-serif;
                ">Try Again</button>
            ` : ''}
        `;
        
        // Store retry callback
        if (retryCallback) {
            this.retryCallbacks = this.retryCallbacks || new Map();
            this.retryCallbacks.set(containerId, retryCallback);
        }
        
        console.log(`❌ Error state shown for "${containerId}"`);
    },
    
    // Show success state
    showSuccess: function(containerId, options = {}) {
        const {
            title = 'Loading Complete',
            subtitle = 'Content loaded successfully',
            autoHide = true,
            hideDelay = 1000
        } = options;
        
        const overlay = this.loadingElements.get(containerId);
        if (!overlay) return;
        
        overlay.className = 'simenium-loading-overlay simenium-loading-success';
        overlay.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
            <div class="simenium-loading-text">${title}</div>
            <div class="simenium-loading-subtitle">${subtitle}</div>
        `;
        
        if (autoHide) {
            setTimeout(() => {
                this.hide(containerId);
            }, hideDelay);
        }
        
        console.log(`✅ Success state shown for "${containerId}"`);
    },
    
    // Hide loading state
    hide: function(containerId) {
        const overlay = this.loadingElements.get(containerId);
        if (overlay) {
            overlay.classList.add('simenium-fade-out');
            setTimeout(() => {
                if (overlay.parentElement) {
                    overlay.remove();
                }
                this.loadingElements.delete(containerId);
            }, 300);
        }
        
        // Clear timeout
        const timeoutId = this.timeouts.get(containerId);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.timeouts.delete(containerId);
        }
        
        // Clear progress tracker
        this.progressTrackers.delete(containerId);
        
        console.log(`⏳ Loading state hidden for "${containerId}"`);
    },
    
    // Retry loading
    retry: function(containerId) {
        const retryCallback = this.retryCallbacks?.get(containerId);
        if (retryCallback) {
            this.hide(containerId);
            setTimeout(() => {
                retryCallback();
            }, 100);
        } else {
            // Default retry behavior - reload the page
            window.location.reload();
        }
    },
    
    // Check if loading
    isLoading: function(containerId) {
        return this.loadingElements.has(containerId);
    },
    
    // Get progress
    getProgress: function(containerId) {
        return this.progressTrackers.get(containerId) || 0;
    },
    
    // Show loading for Three.js scene
    showThreeJSLoading: function(containerId, manager) {
        this.show(containerId, {
            title: 'Loading 3D Model...',
            subtitle: 'Downloading and preparing the 3D visualization',
            showProgress: true,
            timeout: 45000
        });
        
        // Track Three.js loading progress
        if (manager) {
            manager.onProgress = (url, loaded, total) => {
                if (total > 0) {
                    const progress = (loaded / total) * 100;
                    this.updateProgress(containerId, progress, `Loading 3D Model... ${Math.round(progress)}%`);
                }
            };
            
            manager.onLoad = () => {
                this.showSuccess(containerId, {
                    title: '3D Model Loaded',
                    subtitle: 'Ready to explore!',
                    autoHide: true,
                    hideDelay: 800
                });
            };
            
            manager.onError = (error) => {
                console.error('Three.js loading error:', error);
                this.showError(containerId, {
                    title: '3D Model Failed to Load',
                    subtitle: 'There was an error loading the 3D model. Please check your connection and try again.',
                    showRetry: true
                });
            };
        }
    }
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SimeniumLoadingManager.init();
    });
} else {
    SimeniumLoadingManager.init();
}

console.log('⏳ Loading Manager loaded');
