/**
 * Path Resolution and CORS Handler for Simenium
 * Handles GitHub Pages specific issues and CORS problems
 */

window.SimeniumPathResolver = {
    // Detect if we're running on GitHub Pages
    isGitHubPages: function() {
        return window.location.hostname.includes('github.io') || 
               window.location.hostname.includes('pages.github.com');
    },
    
    // Get base URL for the site
    getBaseURL: function() {
        if (this.isGitHubPages()) {
            // GitHub Pages URL structure: username.github.io/repository-name
            const pathParts = window.location.pathname.split('/').filter(part => part);
            if (pathParts.length > 0) {
                return `/${pathParts[0]}/`;
            }
        }
        return '/';
    },
    
    // Resolve relative path to absolute
    resolvePath: function(relativePath) {
        // Handle different path formats
        if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
            return relativePath;
        }
        
        // Remove leading ./ 
        const cleanPath = relativePath.replace(/^\.\//, '');
        
        // Get base URL
        const baseURL = this.getBaseURL();
        
        // Combine base URL with clean path
        const resolvedPath = baseURL + cleanPath;
        
        console.log(`Path resolved: ${relativePath} -> ${resolvedPath}`);
        return resolvedPath;
    },
    
    // Safe fetch with error handling and retries
    safeFetch: async function(url, options = {}, retries = 3) {
        const resolvedURL = this.resolvePath(url);
        
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Accept': 'application/json,application/octet-stream,*/*',
                'Cache-Control': 'no-cache'
            },
            ...options
        };
        
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                console.log(`Attempt ${attempt}: Fetching ${resolvedURL}`);
                
                const response = await fetch(resolvedURL, defaultOptions);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                return response;
            } catch (error) {
                console.warn(`Fetch attempt ${attempt} failed:`, error);
                
                if (attempt === retries) {
                    // Try alternative approaches on final failure
                    return this.handleFetchFailure(url, error);
                }
                
                // Wait before retry (minimal delay for performance)
                await new Promise(resolve => setTimeout(resolve, Math.min(100 * attempt, 500)));
            }
        }
    },
    
    // Handle fetch failures with fallbacks
    handleFetchFailure: async function(originalURL, error) {
        console.error(`All fetch attempts failed for ${originalURL}:`, error);
        
        // Try different URL variations
        const variations = this.generateURLVariations(originalURL);
        
        for (const variation of variations) {
            try {
                console.log(`Trying URL variation: ${variation}`);
                const response = await fetch(variation);
                if (response.ok) {
                    console.log(`✅ Success with variation: ${variation}`);
                    return response;
                }
            } catch (variationError) {
                console.warn(`Variation failed: ${variation}`, variationError);
            }
        }
        
        // If all fails, throw original error
        throw error;
    },
    
    // Generate URL variations to try
    generateURLVariations: function(originalURL) {
        const variations = [];
        const cleanURL = originalURL.replace(/^\.\//, '');
        
        // Different base paths to try
        const basePaths = [
            './',
            '/',
            window.location.pathname.split('/').slice(0, -1).join('/') + '/',
            this.getBaseURL()
        ];
        
        basePaths.forEach(basePath => {
            variations.push(basePath + cleanURL);
            
            // Try with different cases
            variations.push(basePath + cleanURL.toLowerCase());
            
            // Try without cache busting
            if (cleanURL.includes('?')) {
                variations.push(basePath + cleanURL.split('?')[0]);
            }
        });
        
        return [...new Set(variations)]; // Remove duplicates
    },
    
    // Check if resource exists
    checkResourceExists: async function(url) {
        try {
            const response = await this.safeFetch(url, { method: 'HEAD' }, 1);
            return response !== null;
        } catch (error) {
            return false;
        }
    },
    
    // Validate all project resources
    validateResources: async function() {
        const resources = [
            './dist/output.css',
            './js/error-handler.js',
            './js/performance-monitor.js',
            './js/canvas-validator.js',
            './js/memory-manager.js',
            './js/mobile-optimizer.js',
            './js/model-fallback.js'
        ];
        
        const results = {};
        
        for (const resource of resources) {
            const exists = await this.checkResourceExists(resource);
            results[resource] = exists;
            
            if (!exists) {
                console.warn(`⚠️ Resource not found: ${resource}`);
            } else {
                console.log(`✅ Resource validated: ${resource}`);
            }
        }
        
        return results;
    },
    
    // Handle CORS errors specifically
    handleCORSError: function(error, url) {
        if (error.message.includes('CORS') || 
            error.message.includes('fetch') ||
            error.name === 'TypeError') {
            
            console.error('🚫 CORS error detected for:', url);
            
            // Show user-friendly message
            if (window.SimeniumErrorHandler) {
                window.SimeniumErrorHandler.showUserError(
                    new Error('Network access blocked by browser security'),
                    'CORS Error'
                );
            }
            
            return true; // Handled
        }
        return false; // Not a CORS error
    }
};

// Replace global fetch with safe fetch for specific patterns
const originalFetch = window.fetch;
window.fetch = function(url, options) {
    // Only intercept relative URLs and specific file types
    if (typeof url === 'string' && 
        (url.startsWith('./') || url.endsWith('.json') || url.endsWith('.glb'))) {
        
        return SimeniumPathResolver.safeFetch(url, options).catch(error => {
            if (!SimeniumPathResolver.handleCORSError(error, url)) {
                throw error;
            }
            // Return a rejected promise for unhandled CORS errors
            return Promise.reject(error);
        });
    }
    
    // Use original fetch for other URLs
    return originalFetch.call(this, url, options);
};

console.log('🔗 Path Resolver and CORS Handler loaded');
