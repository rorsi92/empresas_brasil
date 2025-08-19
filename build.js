#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function build() {
  try {
    console.log('🔧 Building React app with Vite...');
    
    // Run vite build with explicit config
    const { stdout, stderr } = await execAsync('npx vite build --config frontend/vite.config.js');
    
    if (stderr) {
      console.warn('Build warnings:', stderr);
    }
    
    console.log('✅ Build completed successfully!');
    console.log(stdout);
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();