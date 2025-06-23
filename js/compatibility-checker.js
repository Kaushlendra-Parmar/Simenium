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
        
        console.log('🌐 Browser compatibility check results:', compatibility);
        
        // Add debug information for ES6
        if (!compatibility.es6) {
            console.warn('⚠️ ES6 features missing. Checking individual features:');
            this.debugES6Support();
        }
        
        // Check for critical issues
        const criticalIssues = this.findCriticalIssues(compatibility);
        if (criticalIssues.length > 0) {
            this.showCompatibilityWarning(criticalIssues);
        }
        
        return compatibility;
    },
    
    // Debug ES6 support in detail
    debugES6Support: function() {
        const features = {
            'Arrow Functions': (() => { try { const test = () => true; return test(); } catch(e) { return false; } })(),
            'Template Literals': (() => { try { const test = `template`; return test === 'template'; } catch(e) { return false; } })(),
            'Const/Let': (() => { try { const test = 'const'; let test2 = 'let'; return true; } catch(e) { return false; } })(),
            'Promises': typeof Promise !== 'undefined',
            'Map': typeof Map !== 'undefined',
            'Set': typeof Set !== 'undefined',
            'Destructuring': (() => { try { const [a] = [1]; const {b} = {b: 2}; return true; } catch(e) { return false; } })(),
            'Default Parameters': (() => { try { const test = (a = 1) => a; return test() === 1; } catch(e) { return false; } })(),
            'Spread Operator': (() => { try { const arr = [1, 2]; const test = [...arr]; return test.length === 2; } catch(e) { return false; } })()
        };
        
        console.table(features);
        
        const missingFeatures = Object.entries(features).filter(([name, supported]) => !supported);
        if (missingFeatures.length > 0) {
            console.warn('❌ Missing ES6 features:', missingFeatures.map(([name]) => name));
        }
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
            // Test for ES6 features without using eval()
            // Check for arrow functions support
            const testArrow = () => true;
            
            // Check for template literals support
            const testTemplate = `template literal support`;
            
            // Check for const/let support (they should be available if we got this far)
            const testConst = 'const support';
            
            // Check for Promise support (part of ES6)
            const hasPromise = typeof Promise !== 'undefined';
            
            // Check for Map/Set support
            const hasMap = typeof Map !== 'undefined';
            const hasSet = typeof Set !== 'undefined';
            
            // Check for destructuring assignment (try/catch for safety)
            let destructuringSupported = false;
            try {
                const [a, b] = [1, 2];
                const {test} = {test: true};
                destructuringSupported = true;
            } catch (error) {
                destructuringSupported = false;
            }
            
            // Return true if all major ES6 features are supported
            return testArrow() && 
                   testTemplate.length > 0 && 
                   testConst.length > 0 && 
                   hasPromise && 
                   hasMap && 
                   hasSet && 
                   destructuringSupported;
                   
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
            issues.push('ES6 not supported - modern JavaScript features unavailable (polyfills will be loaded automatically)');
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
        // Check ES6 support and load polyfills if needed
        const compatibility = this.checkCompatibility();
        
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
        
        // ES6 polyfills for older browsers
        if (!compatibility.es6) {
            console.log('🔧 Loading ES6 polyfills...');
            this.loadES6Polyfills();
        }
    },
    
    // Load ES6 polyfills
    loadES6Polyfills: function() {
        const script = document.createElement('script');
        script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6,es2015,es2016,es2017';
        script.onload = () => {
            console.log('✅ ES6 polyfills loaded');
            // Re-check compatibility after polyfills
            setTimeout(() => {
                const newCompatibility = this.checkCompatibility();
                if (newCompatibility.es6) {
                    console.log('✅ ES6 features now available via polyfills');
                }
            }, 100);
        };
        script.onerror = () => console.error('❌ Failed to load ES6 polyfills');
        document.head.appendChild(script);
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
