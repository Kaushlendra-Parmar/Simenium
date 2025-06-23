/**
 * Global Error Handler for Simenium
 * Catches and reports errors across all model viewers
 */

// Global error tracking
window.SimeniumErrorHandler = {
    errors: [],
    maxErrors: 50,
    
    // Log error with context
    logError: function(error, context = '') {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            message: error.message || error,
            stack: error.stack || '',
            context: context,
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        this.errors.push(errorInfo);
        
        // Keep only recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        console.error('🚨 Simenium Error:', errorInfo);
        
        // Show user-friendly message for critical errors
        if (this.isCriticalError(error)) {
            this.showUserError(error, context);
        }
    },
    
    // Check if error is critical (blocks functionality)
    isCriticalError: function(error) {
        const criticalPatterns = [
            /failed to load/i,
            /network error/i,
            /three is not defined/i,
            /gltfloader is not defined/i,
            /cannot read prop/i,
            /webgl/i
        ];
        
        const message = error.message || error.toString();
        return criticalPatterns.some(pattern => pattern.test(message));
    },
    
    // Show user-friendly error message
    showUserError: function(error, context) {
        const errorDiv = document.getElementById('error-display') || this.createErrorDisplay();
        
        let userMessage = 'An error occurred while loading the 3D model.';
        
        if (error.message && error.message.includes('fetch')) {
            userMessage = 'Failed to load 3D model. Please check your internet connection.';
        } else if (error.message && error.message.includes('WebGL')) {
            userMessage = 'Your browser does not support WebGL. Please use a modern browser.';
        } else if (error.message && error.message.includes('Three')) {
            userMessage = 'Failed to load 3D graphics library. Please refresh the page.';
        }
        
        errorDiv.innerHTML = `
            <div class="error-message">
                <h3>⚠️ Loading Error</h3>
                <p>${userMessage}</p>
                <button onclick="location.reload()" class="error-retry-btn">Retry</button>
                <button onclick="this.parentElement.parentElement.style.display='none'" class="error-close-btn">Close</button>
            </div>
        `;
        errorDiv.style.display = 'block';
    },
    
    // Create error display element
    createErrorDisplay: function() {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-display';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 400px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: none;
            font-family: 'DM Sans', sans-serif;
        `;
        
        document.body.appendChild(errorDiv);
        return errorDiv;
    },
    
    // Get error report for debugging
    getErrorReport: function() {
        return {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            errors: this.errors
        };
    }
};

// Global error listeners
window.addEventListener('error', function(event) {
    SimeniumErrorHandler.logError(event.error || event.message, 'Global JS Error');
});

window.addEventListener('unhandledrejection', function(event) {
    SimeniumErrorHandler.logError(event.reason, 'Unhandled Promise Rejection');
});

// WebGL context lost handler
window.addEventListener('webglcontextlost', function(event) {
    event.preventDefault();
    SimeniumErrorHandler.logError('WebGL context lost', 'WebGL Error');
});

// Style for error messages
const errorStyles = document.createElement('style');
errorStyles.textContent = `
    .error-message h3 {
        margin: 0 0 10px 0;
        font-size: 16px;
    }
    
    .error-message p {
        margin: 0 0 15px 0;
        font-size: 14px;
        line-height: 1.4;
    }
    
    .error-retry-btn, .error-close-btn {
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 10px;
        font-size: 12px;
    }
    
    .error-retry-btn:hover, .error-close-btn:hover {
        background: rgba(255,255,255,0.3);
    }
`;
document.head.appendChild(errorStyles);

console.log('✅ Simenium Error Handler initialized');
