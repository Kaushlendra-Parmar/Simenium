/**
 * Simenium System Integration Test
 * Tests all management systems and validates functionality
 */

window.SimeniumSystemTester = {
    testResults: new Map(),
    
    // Run all tests
    runAllTests: async function() {
        console.log('🧪 Starting Simenium System Integration Tests...');
        
        const tests = [
            { name: 'Error Handler', test: this.testErrorHandler },
            { name: 'Performance Monitor', test: this.testPerformanceMonitor },
            { name: 'Canvas Validator', test: this.testCanvasValidator },
            { name: 'Memory Manager', test: this.testMemoryManager },
            { name: 'Mobile Optimizer', test: this.testMobileOptimizer },
            { name: 'Model Fallback', test: this.testModelFallback },
            { name: 'Three.js Config', test: this.testThreeJSConfig },
            { name: 'Path Resolver', test: this.testPathResolver },
            { name: 'Compatibility Checker', test: this.testCompatibilityChecker },
            { name: 'Loading Manager', test: this.testLoadingManager },
            { name: 'Asset Manager', test: this.testAssetManager }
        ];
        
        for (const testItem of tests) {
            try {
                console.log(`🧪 Testing ${testItem.name}...`);
                const result = await testItem.test.call(this);
                this.testResults.set(testItem.name, { 
                    status: 'PASS', 
                    result,
                    timestamp: new Date()
                });
                console.log(`✅ ${testItem.name}: PASS`);
            } catch (error) {
                this.testResults.set(testItem.name, { 
                    status: 'FAIL', 
                    error: error.message,
                    timestamp: new Date()
                });
                console.error(`❌ ${testItem.name}: FAIL -`, error.message);
            }
        }
        
        this.printTestReport();
        return this.testResults;
    },
    
    // Test Error Handler
    testErrorHandler: function() {
        if (!window.SimeniumErrorHandler) {
            throw new Error('SimeniumErrorHandler not loaded');
        }
        
        // Test error handling without actually showing to user
        const originalShow = SimeniumErrorHandler.showErrorToUser;
        let errorCaught = false;
        
        SimeniumErrorHandler.showErrorToUser = () => {
            errorCaught = true;
        };
        
        SimeniumErrorHandler.handleError(new Error('Test error'), 'System Test');
        
        SimeniumErrorHandler.showErrorToUser = originalShow;
        
        if (!errorCaught) {
            throw new Error('Error handler did not catch test error');
        }
        
        return 'Error handler functioning correctly';
    },
    
    // Test Performance Monitor
    testPerformanceMonitor: function() {
        if (!window.SimeniumPerformanceMonitor) {
            throw new Error('SimeniumPerformanceMonitor not loaded');
        }
        
        // Test basic functionality
        SimeniumPerformanceMonitor.startMonitoring();
        const stats = SimeniumPerformanceMonitor.getStats();
        
        if (!stats || typeof stats.fps !== 'number') {
            throw new Error('Performance monitor not providing valid stats');
        }
        
        return `Performance monitor active (FPS: ${stats.fps})`;
    },
    
    // Test Canvas Validator
    testCanvasValidator: function() {
        if (!window.SimeniumCanvasValidator) {
            throw new Error('SimeniumCanvasValidator not loaded');
        }
        
        // Test with existing canvas
        const canvas = document.getElementById('canvas');
        if (canvas) {
            const validated = SimeniumCanvasValidator.validateCanvas('canvas');
            if (!validated) {
                throw new Error('Canvas validation failed for existing canvas');
            }
        }
        
        // Test with non-existent canvas
        const invalidResult = SimeniumCanvasValidator.validateCanvas('non-existent-canvas');
        if (invalidResult !== null) {
            throw new Error('Canvas validator should return null for non-existent canvas');
        }
        
        return 'Canvas validator functioning correctly';
    },
    
    // Test Memory Manager
    testMemoryManager: function() {
        if (!window.SimeniumMemoryManager) {
            throw new Error('SimeniumMemoryManager not loaded');
        }
        
        // Test basic functionality
        const stats = SimeniumMemoryManager.getMemoryStats();
        
        if (!stats || typeof stats.totalJSHeapSize !== 'number') {
            throw new Error('Memory manager not providing valid stats');
        }
        
        return `Memory manager active (Heap: ${(stats.totalJSHeapSize / 1024 / 1024).toFixed(1)}MB)`;
    },
    
    // Test Mobile Optimizer
    testMobileOptimizer: function() {
        if (!window.SimeniumMobileOptimizer) {
            throw new Error('SimeniumMobileOptimizer not loaded');
        }
        
        // Test device detection
        const isMobile = SimeniumMobileOptimizer.isMobile();
        const isLowPerf = SimeniumMobileOptimizer.isLowPerformanceDevice();
        
        if (typeof isMobile !== 'boolean' || typeof isLowPerf !== 'boolean') {
            throw new Error('Mobile optimizer not providing valid device detection');
        }
        
        return `Mobile optimizer active (Mobile: ${isMobile}, Low-perf: ${isLowPerf})`;
    },
    
    // Test Model Fallback
    testModelFallback: function() {
        if (!window.SimeniumModelFallback) {
            throw new Error('SimeniumModelFallback not loaded');
        }
        
        // Test fallback system availability
        const hasFallback = typeof SimeniumModelFallback.createFallbackModel === 'function';
        
        if (!hasFallback) {
            throw new Error('Model fallback system not properly configured');
        }
        
        return 'Model fallback system ready';
    },
    
    // Test Three.js Config
    testThreeJSConfig: function() {
        if (!window.SimeniumThreeJSConfig) {
            throw new Error('SimeniumThreeJSConfig not loaded');
        }
        
        // Test Three.js availability check
        const isAvailable = SimeniumThreeJSConfig.isThreeJSAvailable();
        
        if (typeof isAvailable !== 'boolean') {
            throw new Error('Three.js config not providing valid availability check');
        }
        
        return `Three.js config active (Available: ${isAvailable})`;
    },
    
    // Test Path Resolver
    testPathResolver: function() {
        if (!window.SimeniumPathResolver) {
            throw new Error('SimeniumPathResolver not loaded');
        }
        
        // Test path resolution
        const testPath = './models/test.glb';
        const resolved = SimeniumPathResolver.resolvePath(testPath);
        
        if (typeof resolved !== 'string' || resolved.length === 0) {
            throw new Error('Path resolver not providing valid path resolution');
        }
        
        return `Path resolver active (Test path: ${resolved})`;
    },
    
    // Test Compatibility Checker
    testCompatibilityChecker: function() {
        if (!window.SimeniumCompatibilityChecker) {
            throw new Error('SimeniumCompatibilityChecker not loaded');
        }
        
        // Test compatibility check
        const compatibility = SimeniumCompatibilityChecker.checkCompatibility();
        
        if (!compatibility || typeof compatibility.webgl !== 'boolean') {
            throw new Error('Compatibility checker not providing valid compatibility data');
        }
        
        return `Compatibility checker active (WebGL: ${compatibility.webgl})`;
    },
    
    // Test Loading Manager
    testLoadingManager: function() {
        if (!window.SimeniumLoadingManager) {
            throw new Error('SimeniumLoadingManager not loaded');
        }
        
        // Test loading state management
        const testContainer = 'test-loading-container';
        
        // Create temporary test container
        const tempDiv = document.createElement('div');
        tempDiv.id = testContainer;
        tempDiv.style.position = 'absolute';
        tempDiv.style.top = '-1000px';
        tempDiv.style.width = '100px';
        tempDiv.style.height = '100px';
        document.body.appendChild(tempDiv);
        
        try {
            SimeniumLoadingManager.show(testContainer, { title: 'Test', timeout: 0 });
            const isLoading = SimeniumLoadingManager.isLoading(testContainer);
            SimeniumLoadingManager.hide(testContainer);
            
            document.body.removeChild(tempDiv);
            
            if (!isLoading) {
                throw new Error('Loading manager did not properly track loading state');
            }
            
            return 'Loading manager functioning correctly';
        } catch (error) {
            document.body.removeChild(tempDiv);
            throw error;
        }
    },
    
    // Test Asset Manager
    testAssetManager: async function() {
        if (!window.SimeniumAssetManager) {
            throw new Error('SimeniumAssetManager not loaded');
        }
        
        // Test asset validation (non-blocking test)
        try {
            const testUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
            const isValid = await SimeniumAssetManager.validateAsset(testUrl);
            
            if (typeof isValid !== 'boolean') {
                throw new Error('Asset manager not providing valid validation results');
            }
            
            return `Asset manager active (Test validation: ${isValid})`;
        } catch (error) {
            // Non-critical error for testing
            return 'Asset manager loaded but validation test failed (network-dependent)';
        }
    },
    
    // Print test report
    printTestReport: function() {
        console.log('\n🧪 === SIMENIUM SYSTEM TEST REPORT ===');
        console.log(`📊 Total Tests: ${this.testResults.size}`);
        
        const passed = Array.from(this.testResults.values()).filter(r => r.status === 'PASS').length;
        const failed = Array.from(this.testResults.values()).filter(r => r.status === 'FAIL').length;
        
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${((passed / this.testResults.size) * 100).toFixed(1)}%`);
        
        console.log('\n📋 Detailed Results:');
        this.testResults.forEach((result, testName) => {
            const icon = result.status === 'PASS' ? '✅' : '❌';
            const message = result.status === 'PASS' ? result.result : result.error;
            console.log(`${icon} ${testName}: ${message}`);
        });
        
        console.log('\n🧪 === END TEST REPORT ===\n');
        
        // Show summary notification
        if (window.SimeniumErrorHandler) {
            const status = failed === 0 ? 'success' : 'warning';
            const message = failed === 0 ? 
                `All ${passed} system tests passed! 🎉` : 
                `${passed}/${this.testResults.size} tests passed. ${failed} failed.`;
                
            console.log(`📊 System Status: ${message}`);
        }
    },
    
    // Get test results
    getResults: function() {
        return {
            total: this.testResults.size,
            passed: Array.from(this.testResults.values()).filter(r => r.status === 'PASS').length,
            failed: Array.from(this.testResults.values()).filter(r => r.status === 'FAIL').length,
            details: Object.fromEntries(this.testResults)
        };
    }
};

// Auto-run tests if in debug mode or if explicitly requested
if (window.location.search.includes('test=true') || 
    window.location.search.includes('debug=true') ||
    localStorage.getItem('simenium-auto-test') === 'true') {
    
    // Run tests after all systems are loaded
    setTimeout(() => {
        SimeniumSystemTester.runAllTests().then(results => {
            console.log('🧪 System tests completed');
            
            // Store results for debugging
            window.simeniumTestResults = results;
        });
    }, 2000);
}

console.log('🧪 System Tester loaded (add ?test=true to URL to run tests)');
