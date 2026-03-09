/**
 * Script to inject environment variables into Angular environment files.
 * Run before build in CI/CD: node scripts/set-env.js
 * 
 * Required environment variables:
 * - SUPABASE_URL
 * - SUPABASE_KEY
 */

const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '../src/environments/environment.ts');

// Read environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables: SUPABASE_URL and/or SUPABASE_KEY');
  console.error('   Set them in your CI/CD environment or .env file');
  process.exit(1);
}

// Read the template file
let content = fs.readFileSync(envFile, 'utf8');

// Replace placeholders
content = content.replace('SUPABASE_URL_PLACEHOLDER', supabaseUrl);
content = content.replace('SUPABASE_KEY_PLACEHOLDER', supabaseKey);

// Write back
fs.writeFileSync(envFile, content, 'utf8');

console.log('✅ Environment variables injected successfully');
console.log(`   SUPABASE_URL: ${supabaseUrl.substring(0, 30)}...`);
