#!/usr/bin/env node

/**
 * Test script to verify GitHub Actions workflow setup
 * This script checks for required files and provides setup guidance
 */

import { access, readFile } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';

async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function checkWorkflowSetup() {
  console.log('🔍 Checking GitHub Actions workflow setup...\n');
  
  const checks = [
    {
      name: 'GitHub Actions workflow file',
      path: '.github/workflows/daily-sync.yml',
      required: true
    },
    {
      name: 'Enhanced sync script',
      path: 'index-enhanced.js',
      required: true
    },
    {
      name: 'Setup documentation',
      path: 'GITHUB_ACTIONS_SETUP.md',
      required: false
    },
    {
      name: 'Original sync script',
      path: 'index.js',
      required: true
    },
    {
      name: 'Package.json',
      path: 'package.json',
      required: true
    }
  ];
  
  let allRequired = true;
  
  for (const check of checks) {
    const exists = await fileExists(check.path);
    const status = exists ? '✅' : (check.required ? '❌' : '⚠️');
    const label = check.required ? 'REQUIRED' : 'OPTIONAL';
    
    console.log(`${status} ${check.name} (${label})`);
    console.log(`   Path: ${check.path}`);
    
    if (!exists && check.required) {
      allRequired = false;
      console.log(`   Status: MISSING - This file is required for the workflow`);
    } else if (!exists) {
      console.log(`   Status: MISSING - This file is optional but recommended`);
    } else {
      console.log(`   Status: FOUND`);
    }
    console.log();
  }
  
  return allRequired;
}

async function checkPackageJson() {
  console.log('📦 Checking package.json configuration...\n');
  
  try {
    const packageContent = await readFile('package.json', 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    console.log('✅ Package.json is valid JSON');
    console.log(`   Name: ${packageJson.name || 'Not specified'}`);
    console.log(`   Version: ${packageJson.version || 'Not specified'}`);
    console.log(`   Type: ${packageJson.type || 'commonjs'}`);
    
    if (packageJson.scripts) {
      console.log('   Scripts:');
      Object.entries(packageJson.scripts).forEach(([name, command]) => {
        console.log(`     - ${name}: ${command}`);
      });
    }
    
    if (packageJson.dependencies) {
      console.log('   Dependencies:');
      Object.entries(packageJson.dependencies).forEach(([name, version]) => {
        console.log(`     - ${name}: ${version}`);
      });
    }
    
    console.log();
    return true;
  } catch (error) {
    console.log('❌ Package.json is invalid or missing');
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

async function provideFinalGuidance() {
  console.log('📋 Next Steps for GitHub Actions Setup:\n');
  
  console.log('1. 🔐 Configure GitHub Secrets:');
  console.log('   Go to your repository → Settings → Secrets and variables → Actions');
  console.log('   Add the following secrets:');
  console.log('   - SMTP_SERVER (e.g., smtp.gmail.com)');
  console.log('   - SMTP_PORT (e.g., 587)');
  console.log('   - SMTP_USERNAME (your email)');
  console.log('   - SMTP_PASSWORD (your email password or app password)');
  console.log('   - NOTIFICATION_EMAIL (email to receive notifications)');
  console.log('   - SMTP_FROM (optional, sender email)\n');
  
  console.log('2. 📤 Push to GitHub:');
  console.log('   git add .');
  console.log('   git commit -m "Add GitHub Actions workflow for daily database sync"');
  console.log('   git push origin main\n');
  
  console.log('3. 🧪 Test the Workflow:');
  console.log('   - Go to GitHub → Actions tab');
  console.log('   - Click "Daily Yu-Gi-Oh Database Sync"');
  console.log('   - Click "Run workflow" for manual testing\n');
  
  console.log('4. 📖 Read Setup Guide:');
  console.log('   See GITHUB_ACTIONS_SETUP.md for detailed configuration instructions\n');
  
  console.log('5. 📅 Workflow Schedule:');
  console.log('   - Runs automatically daily at 2:00 AM UTC');
  console.log('   - Creates releases when database changes are detected');
  console.log('   - Sends email notifications for all events\n');
  
  console.log('🎉 Your workflow is ready to deploy!');
}

async function main() {
  console.log('🚀 GitHub Actions Setup Verification\n');
  console.log('=====================================\n');
  
  const workflowOk = await checkWorkflowSetup();
  const packageOk = await checkPackageJson();
  
  if (workflowOk && packageOk) {
    console.log('✅ All required files are present and valid!\n');
    await provideFinalGuidance();
  } else {
    console.log('❌ Setup incomplete. Please fix the missing or invalid files above.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Setup verification failed:', error.message);
  process.exit(1);
});
