/**
 * ES6 Compatibility Test
 * Tests ES6 features without using eval()
 */

console.log('🧪 Running ES6 Compatibility Test...');

// Test 1: Arrow Functions
try {
    const arrowTest = () => 'arrow function works';
    console.log('✅ Arrow Functions:', arrowTest());
} catch (error) {
    console.error('❌ Arrow Functions failed:', error.message);
}

// Test 2: Template Literals
try {
    const name = 'Simenium';
    const templateTest = `Template literal for ${name} works`;
    console.log('✅ Template Literals:', templateTest);
} catch (error) {
    console.error('❌ Template Literals failed:', error.message);
}

// Test 3: Const/Let
try {
    const constTest = 'const works';
    let letTest = 'let works';
    console.log('✅ Const/Let:', constTest, letTest);
} catch (error) {
    console.error('❌ Const/Let failed:', error.message);
}

// Test 4: Destructuring
try {
    const [first, second] = ['destructuring', 'works'];
    const {test} = {test: 'object destructuring works'};
    console.log('✅ Destructuring:', first, second, test);
} catch (error) {
    console.error('❌ Destructuring failed:', error.message);
}

// Test 5: Default Parameters
try {
    const defaultParamTest = (param = 'default parameter works') => param;
    console.log('✅ Default Parameters:', defaultParamTest());
} catch (error) {
    console.error('❌ Default Parameters failed:', error.message);
}

// Test 6: Spread Operator
try {
    const arr1 = [1, 2, 3];
    const arr2 = [...arr1, 4, 5];
    console.log('✅ Spread Operator:', arr2);
} catch (error) {
    console.error('❌ Spread Operator failed:', error.message);
}

// Test 7: Promises
try {
    if (typeof Promise !== 'undefined') {
        console.log('✅ Promises: available');
    } else {
        console.error('❌ Promises: not available');
    }
} catch (error) {
    console.error('❌ Promises failed:', error.message);
}

// Test 8: Map/Set
try {
    if (typeof Map !== 'undefined' && typeof Set !== 'undefined') {
        const map = new Map();
        const set = new Set();
        console.log('✅ Map/Set: available');
    } else {
        console.error('❌ Map/Set: not available');
    }
} catch (error) {
    console.error('❌ Map/Set failed:', error.message);
}

console.log('🧪 ES6 Compatibility Test Complete');

// Add to window for manual testing
window.testES6 = function() {
    if (window.SimeniumCompatibilityChecker) {
        const compatibility = window.SimeniumCompatibilityChecker.checkCompatibility();
        console.log('Current ES6 compatibility:', compatibility.es6);
        if (!compatibility.es6) {
            window.SimeniumCompatibilityChecker.debugES6Support();
        }
    }
};
