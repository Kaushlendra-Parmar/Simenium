/**
 * Browser Compatibility Checker for Simenium
 * Detects and handles browser-specific issues
 */

window.SimeniumCompatibilityChecker = {
    // Check browser compatibility
    checkCompatibility: function() {
        const compatibility = {
            webgl: this.checkWebGL(),
            webgl2: this.checkWebGL2(),
            es6: this.checkES6(),
            fetch: this.checkFetch(),
            promises: this.checkPromises(),
            localStorage: this.checkLocalStorage(),
            touch: this.checkTouch(),
            browser: this.getBrowserInfo()
        };
        
        console.log('🌐 Browser compatibility:', compatibility);
        
        // Check for critical issues
        const criticalIssues = this.findCriticalIssues(compatibility);
        if (criticalIssues.length > 0) {
            this.showCompatibilityWarning(criticalIssues);
        }
        
        return compatibility;
    },
    
    // Check WebGL support
    checkWebGL: function() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        } catch (error) {
            return false;
        }
    },
    
    // Check WebGL2 support
    checkWebGL2: function() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2');
            return !!gl;
        } catch (error) {
            return false;
        }
    },
    
    // Check ES6 support
    checkES6: function() {
        try {
            // Test arrow functions, const/let, template literals
            eval('const test = () => `ES6 ${true}`;');
            return true;
        } catch (error) {
            return false;
        }
    },
    
    // Check Fetch API support
    checkFetch: function() {
        return typeof fetch !== 'undefined';
    },
    
    // Check Promises support
    checkPromises: function() {
        return typeof Promise !== 'undefined';
    },
    
    // Check localStorage support
    checkLocalStorage: function() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    },
    
    // Check touch support
    checkTouch: function() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    
    // Get browser information
    getBrowserInfo: function() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        let version = 'Unknown';
        
        if (ua.includes('Chrome')) {
            browser = 'Chrome';
            version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Firefox')) {
            browser = 'Firefox';
            version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
            browser = 'Safari';
            version = ua.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Edge')) {
            browser = 'Edge';
            version = ua.match(/Edge\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (ua.includes('MSIE') || ua.includes('Trident')) {
            browser = 'Internet Explorer';
            version = ua.match(/(?:MSIE |rv:)([0-9.]+)/)?.[1] || 'Unknown';
        }
        
        return { browser, version, userAgent: ua };
    },
    
    // Find critical compatibility issues
    findCriticalIssues: function(compatibility) {
        const issues = [];
        
        if (!compatibility.webgl) {
            issues.push('WebGL not supported - 3D models will not work');
        }
        
        if (!compatibility.es6) {
            issues.push('ES6 not supported - modern JavaScript features unavailable');
        }
        
        if (!compatibility.fetch) {
            issues.push('Fetch API not supported - file loading may fail');
        }
        
        if (!compatibility.promises) {
            issues.push('Promises not supported - asynchronous operations may fail');
        }
        
        // Check for old browsers
        if (compatibility.browser.browser === 'Internet Explorer') {
            issues.push('Internet Explorer is not supported - please use a modern browser');
        }
        
        if (compatibility.browser.browser === 'Chrome' && 
            parseInt(compatibility.browser.version) < 60) {
            issues.push('Chrome version too old - please update your browser');
        }
        
        if (compatibility.browser.browser === 'Firefox' && 
            parseInt(compatibility.browser.version) < 60) {
            issues.push('Firefox version too old - please update your browser');
        }
        
        return issues;
    },
    
    // Show compatibility warning
    showCompatibilityWarning: function(issues) {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(45deg, #ff6b6b, #ee5a52);
            color: white;
            padding: 20px;
            text-align: center;
            font-family: 'DM Sans', sans-serif;
            z-index: 10001;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        
        warning.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto;">
                <h3 style="margin: 0 0 10px 0; font-size: 18px;">⚠️ Browser Compatibility Issues Detected</h3>
                <div style="margin-bottom: 15px; font-size: 14px;">
                    ${issues.map(issue => `• ${issue}`).join('<br>')}
                </div>
                <div style="margin-bottom: 15px; font-size: 13px; opacity: 0.9;">
                    For the best experience, please use the latest version of Chrome, Firefox, Safari, or Edge.
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 8px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    margin-right: 10px;
                ">Continue Anyway</button>
                <button onclick="window.history.back()" style="
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 8px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">Go Back</button>
            </div>
        `;
        
        document.body.appendChild(warning);
        
        // Auto-hide after 30 seconds
        setTimeout(() => {
            if (warning.parentElement) {
                warning.style.transform = 'translateY(-100%)';
                setTimeout(() => warning.remove(), 300);
            }
        }, 30000);
    },
    
    // Apply browser-specific polyfills
    applyPolyfills: function() {
        // Fetch polyfill for older browsers
        if (!window.fetch) {
            console.log('🔧 Loading fetch polyfill...');
            this.loadFetchPolyfill();
        }
        
        // Promise polyfill for older browsers
        if (!window.Promise) {
            console.log('🔧 Loading Promise polyfill...');
            this.loadPromisePolyfill();
        }
    },
    
    // Load fetch polyfill
    loadFetchPolyfill: function() {
        const script = document.createElement('script');
        script.src = 'https://polyfill.io/v3/polyfill.min.js?features=fetch';
        script.onload = () => console.log('✅ Fetch polyfill loaded');
        script.onerror = () => console.error('❌ Failed to load fetch polyfill');
        document.head.appendChild(script);
    },
    
    // Load Promise polyfill
    loadPromisePolyfill: function() {
        const script = document.createElement('script');
        script.src = 'https://polyfill.io/v3/polyfill.min.js?features=Promise';
        script.onload = () => console.log('✅ Promise polyfill loaded');
        script.onerror = () => console.error('❌ Failed to load Promise polyfill');
        document.head.appendChild(script);
    }
};

// Auto-initialize compatibility checking
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SimeniumCompatibilityChecker.checkCompatibility();
        SimeniumCompatibilityChecker.applyPolyfills();
    });
} else {
    SimeniumCompatibilityChecker.checkCompatibility();
    SimeniumCompatibilityChecker.applyPolyfills();
}

console.log('🌐 Compatibility Checker loaded');
