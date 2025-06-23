/**
 * Performance Monitor for Simenium
 * Tracks loading times, memory usage, and performance metrics
 */

window.SimeniumPerformanceMonitor = {
    metrics: {
        pageLoad: null,
        modelLoads: [],
        memoryUsage: [],
        renderPerformance: []
    },
    
    // Initialize performance monitoring
    init: function() {
        this.trackPageLoad();
        this.trackMemoryUsage();
        this.trackWebGLPerformance();
        
        console.log('📊 Performance Monitor initialized');
    },
    
    // Track page load performance
    trackPageLoad: function() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            this.metrics.pageLoad = {
                timestamp: Date.now(),
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                totalLoadTime: perfData.loadEventEnd - perfData.fetchStart
            };
            
            console.log('⏱️ Page Load Metrics:', this.metrics.pageLoad);
        });
    },
    
    // Track model loading performance
    trackModelLoad: function(modelName, startTime, endTime, success = true) {
        const loadTime = endTime - startTime;
        const metric = {
            timestamp: Date.now(),
            modelName: modelName,
            loadTime: loadTime,
            success: success
        };
        
        this.metrics.modelLoads.push(metric);
        
        // Keep only recent loads
        if (this.metrics.modelLoads.length > 20) {
            this.metrics.modelLoads.shift();
        }
        
        if (loadTime > 5000) { // More than 5 seconds
            console.warn('🐌 Slow model load detected:', metric);
        }
        
        console.log('📦 Model Load:', metric);
    },
    
    // Track memory usage
    trackMemoryUsage: function() {
        if (performance.memory) {
            setInterval(() => {
                const memory = {
                    timestamp: Date.now(),
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                };
                
                this.metrics.memoryUsage.push(memory);
                
                // Keep only recent measurements
                if (this.metrics.memoryUsage.length > 60) {
                    this.metrics.memoryUsage.shift();
                }
                
                // Warn if memory usage is high
                if (memory.used > memory.limit * 0.8) {
                    console.warn('🚨 High memory usage detected:', memory);
                }
            }, 10000); // Check every 10 seconds
        }
    },
    
    // Track WebGL render performance
    trackWebGLPerformance: function() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const trackFrame = () => {
            frameCount++;
            const currentTime = performance.now();
            
            // Calculate FPS every second
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                const metric = {
                    timestamp: Date.now(),
                    fps: fps,
                    frameTime: (currentTime - lastTime) / frameCount
                };
                
                this.metrics.renderPerformance.push(metric);
                
                // Keep only recent measurements
                if (this.metrics.renderPerformance.length > 60) {
                    this.metrics.renderPerformance.shift();
                }
                
                // Warn if FPS is low
                if (fps < 30) {
                    console.warn('🎮 Low FPS detected:', metric);
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(trackFrame);
        };
        
        requestAnimationFrame(trackFrame);
    },
    
    // Get performance report
    getReport: function() {
        return {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            ...this.metrics
        };
    },
    
    // Check for performance issues
    checkPerformanceIssues: function() {
        const issues = [];
        
        // Check page load time
        if (this.metrics.pageLoad && this.metrics.pageLoad.totalLoadTime > 10000) {
            issues.push('Slow page load (> 10s)');
        }
        
        // Check model load times
        const slowModels = this.metrics.modelLoads.filter(load => load.loadTime > 5000);
        if (slowModels.length > 0) {
            issues.push(`${slowModels.length} slow model loads detected`);
        }
        
        // Check memory usage
        const latestMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
        if (latestMemory && latestMemory.used > latestMemory.limit * 0.7) {
            issues.push('High memory usage (> 70%)');
        }
        
        // Check FPS
        const latestFPS = this.metrics.renderPerformance[this.metrics.renderPerformance.length - 1];
        if (latestFPS && latestFPS.fps < 30) {
            issues.push('Low FPS (< 30)');
        }
        
        return issues;
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SimeniumPerformanceMonitor.init();
    });
} else {
    SimeniumPerformanceMonitor.init();
}
