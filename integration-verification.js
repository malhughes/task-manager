#!/usr/bin/env node

/**
 * Complete Application Integration Verification Script
 * 
 * This script verifies that all components are properly integrated
 * and the complete user journey works as expected.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting Complete Application Integration Verification...\n');

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
    log(`✅ ${message}`, colors.green);
}

function error(message) {
    log(`❌ ${message}`, colors.red);
}

function info(message) {
    log(`ℹ️  ${message}`, colors.blue);
}

function warning(message) {
    log(`⚠️  ${message}`, colors.yellow);
}

// Test results tracking
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

function runTest(testName, testFn) {
    try {
        info(`Running: ${testName}`);
        testFn();
        success(`PASSED: ${testName}`);
        testResults.passed++;
        testResults.tests.push({ name: testName, status: 'PASSED' });
    } catch (err) {
        error(`FAILED: ${testName}`);
        error(`Error: ${err.message}`);
        testResults.failed++;
        testResults.tests.push({ name: testName, status: 'FAILED', error: err.message });
    }
    console.log('');
}

// Verification Tests

runTest('1. Verify Project Structure', () => {
    const requiredFiles = [
        'backend/server.js',
        'backend/routes/task.route.js',
        'backend/controllers/task.controller.js',
        'backend/models/ticket.model.js',
        'frontend/src/main.jsx',
        'frontend/src/components/KanbanBoard.jsx',
        'frontend/src/components/Swimlane.jsx',
        'frontend/src/components/TaskCard.jsx',
        'frontend/src/components/TaskModal.jsx',
        'frontend/src/services/taskService.js',
        'frontend/src/services/authService.js',
        'frontend/src/contexts/AuthContext.jsx'
    ];

    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

    if (missingFiles.length > 0) {
        throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }
});

runTest('2. Verify Backend Dependencies', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['express', 'mongoose', 'cors', 'cookie-parser', 'bcryptjs', 'jsonwebtoken'];

    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

    if (missingDeps.length > 0) {
        throw new Error(`Missing backend dependencies: ${missingDeps.join(', ')}`);
    }
});

runTest('3. Verify Frontend Dependencies', () => {
    const packageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
    const requiredDeps = ['react', 'react-dom', 'react-router-dom', '@mui/material', 'react-dnd'];

    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

    if (missingDeps.length > 0) {
        throw new Error(`Missing frontend dependencies: ${missingDeps.join(', ')}`);
    }
});

runTest('4. Verify Backend API Routes Configuration', () => {
    const serverContent = fs.readFileSync('backend/server.js', 'utf8');

    const requiredRoutes = [
        'app.use("/api/auth", authRoute)',
        'app.use("/api/tasks", taskRoute)'
    ];

    const missingRoutes = requiredRoutes.filter(route => !serverContent.includes(route));

    if (missingRoutes.length > 0) {
        throw new Error(`Missing route configurations: ${missingRoutes.join(', ')}`);
    }
});

runTest('5. Verify Task Model Schema', () => {
    const modelContent = fs.readFileSync('backend/models/ticket.model.js', 'utf8');

    const requiredFields = ['assignee', 'title', 'description', 'status', 'priority'];
    const missingFields = requiredFields.filter(field => !modelContent.includes(field));

    if (missingFields.length > 0) {
        throw new Error(`Missing model fields: ${missingFields.join(', ')}`);
    }
});

runTest('6. Verify Frontend Routing Configuration', () => {
    const mainContent = fs.readFileSync('frontend/src/main.jsx', 'utf8');

    const requiredComponents = ['LogInPage', 'SignUpPage', 'DashboardPage', 'ProtectedRoute'];
    const missingComponents = requiredComponents.filter(comp => !mainContent.includes(comp));

    if (missingComponents.length > 0) {
        throw new Error(`Missing routing components: ${missingComponents.join(', ')}`);
    }
});

runTest('7. Verify Drag and Drop Integration', () => {
    const mainContent = fs.readFileSync('frontend/src/main.jsx', 'utf8');

    if (!mainContent.includes('DndProvider') || !mainContent.includes('HTML5Backend')) {
        throw new Error('Drag and drop provider not properly configured');
    }
});

runTest('8. Verify Authentication Context Integration', () => {
    const mainContent = fs.readFileSync('frontend/src/main.jsx', 'utf8');

    if (!mainContent.includes('AuthProvider')) {
        throw new Error('Authentication context not properly integrated');
    }
});

runTest('9. Verify API Service Integration', () => {
    const kanbanContent = fs.readFileSync('frontend/src/components/KanbanBoard.jsx', 'utf8');

    const requiredServices = ['taskService.getTasks', 'taskService.createTask', 'taskService.updateTask', 'taskService.deleteTask'];
    const missingServices = requiredServices.filter(service => !kanbanContent.includes(service));

    if (missingServices.length > 0) {
        throw new Error(`Missing API service integrations: ${missingServices.join(', ')}`);
    }
});

runTest('10. Verify Error Handling Integration', () => {
    const kanbanContent = fs.readFileSync('frontend/src/components/KanbanBoard.jsx', 'utf8');

    if (!kanbanContent.includes('catch') || !kanbanContent.includes('error')) {
        throw new Error('Error handling not properly integrated');
    }
});

runTest('11. Run Backend Tests', () => {
    try {
        execSync('npm test backend/tests/task.test.js', { stdio: 'pipe' });
    } catch (err) {
        throw new Error('Backend tests failed');
    }
});

runTest('12. Run Frontend Integration Tests', () => {
    try {
        execSync('cd frontend && npm test BasicIntegration.test.jsx', { stdio: 'pipe' });
    } catch (err) {
        throw new Error('Frontend integration tests failed');
    }
});

runTest('13. Verify CORS Configuration', () => {
    const serverContent = fs.readFileSync('backend/server.js', 'utf8');

    if (!serverContent.includes('cors') || !serverContent.includes('credentials: true')) {
        throw new Error('CORS not properly configured for frontend-backend communication');
    }
});

runTest('14. Verify Environment Configuration', () => {
    const envExists = fs.existsSync('.env');

    if (!envExists) {
        warning('No .env file found - make sure to configure environment variables');
    }
});

runTest('15. Verify Requirements Coverage', () => {
    const requirements = [
        { id: '1.1', description: 'Login form display', file: 'frontend/src/pages/LogInPage.jsx' },
        { id: '2.1', description: 'Task creation', file: 'frontend/src/components/TaskModal.jsx' },
        { id: '3.1', description: 'Three swimlanes', file: 'frontend/src/components/KanbanBoard.jsx' },
        { id: '4.1', description: 'Drag and drop', file: 'frontend/src/main.jsx' },
        { id: '5.1', description: 'Data persistence', file: 'frontend/src/services/taskService.js' },
        { id: '6.1', description: 'Responsive interface', file: 'frontend/src/components/KanbanBoard.jsx' }
    ];

    const missingRequirements = requirements.filter(req => !fs.existsSync(req.file));

    if (missingRequirements.length > 0) {
        throw new Error(`Missing requirement implementations: ${missingRequirements.map(r => r.id).join(', ')}`);
    }
});

// Print final results
console.log('\n' + '='.repeat(60));
log(`${colors.bold}INTEGRATION VERIFICATION RESULTS${colors.reset}`);
console.log('='.repeat(60));

if (testResults.failed === 0) {
    success(`🎉 ALL TESTS PASSED! (${testResults.passed}/${testResults.passed + testResults.failed})`);
    success('✨ Application is fully integrated and ready for deployment!');
} else {
    error(`❌ ${testResults.failed} test(s) failed out of ${testResults.passed + testResults.failed}`);

    console.log('\nFailed Tests:');
    testResults.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
            error(`  - ${test.name}: ${test.error}`);
        });
}

console.log('\nDetailed Results:');
testResults.tests.forEach(test => {
    const status = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`  ${status} ${test.name}`);
});

console.log('\n' + '='.repeat(60));

// Exit with appropriate code
process.exit(testResults.failed === 0 ? 0 : 1);