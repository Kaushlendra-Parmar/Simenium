/**
 * GitHub Pages Configuration Helper
 * Helps diagnose and fix common GitHub Pages deployment issues
 */

window.GitHubPagesFixer = {
    // Check current deployment status
    checkDeploymentStatus: function() {
        console.log('🔍 Checking GitHub Pages deployment status...');
        
        // Check if we're on GitHub Pages
        const isGitHubPages = window.location.hostname.includes('github.io');
        const currentURL = window.location.href;
        
        console.log(`📍 Current URL: ${currentURL}`);
        console.log(`🌐 Is GitHub Pages: ${isGitHubPages}`);
        
        if (isGitHubPages) {
            console.log('✅ Successfully deployed to GitHub Pages!');
            this.runPostDeploymentChecks();
        } else {
            console.log('🔧 Running local development checks...');
            this.runLocalChecks();
        }
    },
    
    // Run checks for GitHub Pages deployment
    runPostDeploymentChecks: function() {
        console.log('🚀 Running post-deployment checks...');
        
        // Check if CSS is loading
        const cssLink = document.querySelector('link[href*="output.css"]');
        if (cssLink) {
            console.log('✅ CSS file linked correctly');
        } else {
            console.log('❌ CSS file not found - check build process');
        }
        
        // Check if models directory exists
        this.checkAssetPaths();
        
        // Test a simple fetch to see if CORS is working
        this.testCORSConfiguration();
    },
    
    // Run checks for local development
    runLocalChecks: function() {
        console.log('🔧 Running local development checks...');
        
        // Check if we need to run the build
        const cssExists = document.querySelector('link[href*="output.css"]');
        if (!cssExists) {
            console.log('⚠️ CSS not built yet. Run: npm run build');
        }
        
        console.log('💡 To test GitHub Pages deployment:');
        console.log('1. git add .');
        console.log('2. git commit -m "fix: update deployment configuration"');
        console.log('3. git push origin main');
        console.log('4. Check Actions tab in GitHub repository');
    },
    
    // Check if assets are accessible
    checkAssetPaths: function() {
        const testPaths = [
            './dist/output.css',
            './js/error-handler.js',
            './atom/models/atom.glb'
        ];
        
        testPaths.forEach(async (path) => {
            try {
                const response = await fetch(path, { method: 'HEAD' });
                if (response.ok) {
                    console.log(`✅ Asset accessible: ${path}`);
                } else {
                    console.log(`❌ Asset not found: ${path} (${response.status})`);
                }
            } catch (error) {
                console.log(`❌ Asset failed to load: ${path} - ${error.message}`);
            }
        });
    },
    
    // Test CORS configuration
    testCORSConfiguration: function() {
        // Test JSON loading (common CORS issue)
        if (window.location.pathname.includes('/induction motor/')) {
            fetch('./models/locations.json')
                .then(response => {
                    if (response.ok) {
                        console.log('✅ JSON loading works (CORS configured correctly)');
                    } else {
                        console.log('❌ JSON loading failed - CORS issue');
                    }
                })
                .catch(error => {
                    console.log('❌ CORS error:', error.message);
                });
        }
    },
    
    // Show deployment instructions
    showDeploymentInstructions: function() {
        console.log('\n🚀 === GITHUB PAGES DEPLOYMENT INSTRUCTIONS ===');
        console.log('');
        console.log('1. 📝 REPOSITORY SETTINGS:');
        console.log('   - Go to Settings → Pages');
        console.log('   - Set Source to "GitHub Actions"');
        console.log('   - Save settings');
        console.log('');
        console.log('2. 🔧 PUSH LATEST CHANGES:');
        console.log('   git add .');
        console.log('   git commit -m "fix: update GitHub Actions deployment"');
        console.log('   git push origin main');
        console.log('');
        console.log('3. 📊 MONITOR DEPLOYMENT:');
        console.log('   - Check Actions tab for workflow status');
        console.log('   - Look for "Build and Deploy Simenium" workflow');
        console.log('   - Wait for green checkmark');
        console.log('');
        console.log('4. 🎯 TEST DEPLOYMENT:');
        console.log('   - Visit: https://[username].github.io/[repo-name]');
        console.log('   - Add ?validate=true to run deployment tests');
        console.log('');
        console.log('🚀 === END INSTRUCTIONS ===\n');
    }
};

// Auto-run deployment checks
GitHubPagesFixer.checkDeploymentStatus();

console.log('🔧 GitHub Pages Fixer loaded');
console.log('📋 Run GitHubPagesFixer.showDeploymentInstructions() for help');