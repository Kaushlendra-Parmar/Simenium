/**
 * Mobile Device Optimization for Simenium
 * Handles mobile-specific performance and interaction issues
 */

window.SimeniumMobileOptimizer = {
    // Device detection
    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    isIOS: function() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    },
    
    isAndroid: function() {
        return /Android/.test(navigator.userAgent);
    },
    
    // Check device capabilities
    getDeviceCapabilities: function() {
        const capabilities = {
            isMobile: this.isMobile(),
            isIOS: this.isIOS(),
            isAndroid: this.isAndroid(),
            hasTouch: 'ontouchstart' in window,
            devicePixelRatio: window.devicePixelRatio || 1,
            memory: navigator.deviceMemory || 'unknown',
            cores: navigator.hardwareConcurrency || 'unknown',
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink
            } : 'unknown'
        };
        
        // Only log in debug mode
        if (window.location.search.includes('debug=true')) {
            console.log('📱 Device capabilities:', capabilities);
        }
        return capabilities;
    },
    
    // Apply mobile optimizations
    applyMobileOptimizations: function() {
        const capabilities = this.getDeviceCapabilities();
        
        if (capabilities.isMobile) {
            // Only log in debug mode
            if (window.location.search.includes('debug=true')) {
                console.log('📱 Applying mobile optimizations...');
            }
            
            // Reduce quality for mobile devices
            this.reduceMobileQuality();
            
            // Add mobile-specific touch handlers
            this.addMobileTouchHandlers();
            
            // Optimize viewport
            this.optimizeViewport();
            
            // Show mobile-specific UI hints
            this.showMobileHints();
        }
        
        // Apply low-end device optimizations
        if (capabilities.memory && capabilities.memory < 4) {
            console.log('🔧 Applying low-memory device optimizations...');
            this.applyLowMemoryOptimizations();
        }
        
        // Apply slow connection optimizations
        if (capabilities.connection && 
            (capabilities.connection.effectiveType === '2g' || 
             capabilities.connection.effectiveType === 'slow-2g')) {
            console.log('🐌 Applying slow connection optimizations...');
            this.applySlowConnectionOptimizations();
        }
    },
    
    // Reduce quality for mobile
    reduceMobileQuality: function() {
        // Add CSS class for mobile-specific styling
        document.body.classList.add('mobile-device');
        
        // Reduce animation complexity
        const style = document.createElement('style');
        style.textContent = `
            .mobile-device * {
                animation-duration: 0.2s !important;
                transition-duration: 0.2s !important;
            }
            .mobile-device .model-card:hover {
                transform: none !important;
            }
        `;
        document.head.appendChild(style);
    },
    
    // Add mobile touch handlers
    addMobileTouchHandlers: function() {
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Add touch feedback
        document.addEventListener('touchstart', (event) => {
            if (event.target.classList.contains('model-card') || 
                event.target.closest('.model-card')) {
                event.target.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
            }
        });
        
        document.addEventListener('touchend', (event) => {
            if (event.target.classList.contains('model-card') || 
                event.target.closest('.model-card')) {
                setTimeout(() => {
                    event.target.style.backgroundColor = '';
                }, 150);
            }
        });
    },
    
    // Optimize viewport for mobile
    optimizeViewport: function() {
        // Ensure proper viewport meta tag
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        
        // Add mobile-specific meta tags
        const metas = [
            { name: 'mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
        ];
        
        metas.forEach(meta => {
            if (!document.querySelector(`meta[name="${meta.name}"]`)) {
                const metaElement = document.createElement('meta');
                metaElement.name = meta.name;
                metaElement.content = meta.content;
                document.head.appendChild(metaElement);
            }
        });
    },
    
    // Show mobile usage hints
    showMobileHints: function() {
        if (localStorage.getItem('mobile-hints-shown')) return;
        
        const hint = document.createElement('div');
        hint.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: rgba(56, 189, 248, 0.95);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            text-align: center;
            animation: slideUp 0.3s ease-out;
        `;
        
        hint.innerHTML = `
            <div style="margin-bottom: 10px;">📱 Mobile Tip: Use pinch to zoom and drag to rotate 3D models</div>
            <button onclick="this.parentElement.remove(); localStorage.setItem('mobile-hints-shown', 'true')" 
                    style="background: rgba(255,255,255,0.3); border: none; color: white; padding: 5px 15px; border-radius: 4px; font-size: 12px;">
                Got it!
            </button>
        `;
        
        document.body.appendChild(hint);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (hint.parentElement) {
                hint.remove();
                localStorage.setItem('mobile-hints-shown', 'true');
            }
        }, 10000);
    },
    
    // Apply low memory optimizations
    applyLowMemoryOptimizations: function() {
        // Reduce texture quality
        window.SIMENIUM_LOW_MEMORY = true;
        
        // Add warning
        console.warn('⚠️ Low memory device detected - reducing quality');
    },
    
    // Apply slow connection optimizations
    applySlowConnectionOptimizations: function() {
        // Enable progressive loading
        window.SIMENIUM_SLOW_CONNECTION = true;
        
        console.warn('🐌 Slow connection detected - enabling progressive loading');
    }
};

// Add mobile-specific CSS animations
const mobileStyles = document.createElement('style');
mobileStyles.textContent = `
    @keyframes slideUp {
        from {
            transform: translateY(100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(mobileStyles);

// Auto-initialize mobile optimizations
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SimeniumMobileOptimizer.applyMobileOptimizations();
    });
} else {
    SimeniumMobileOptimizer.applyMobileOptimizations();
}

console.log('📱 Mobile Optimizer loaded');
