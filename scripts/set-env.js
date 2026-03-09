// Injeta variáveis de ambiente no build
// Uso: node scripts/set-env.js

const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '../src/environments/environment.ts');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltam SUPABASE_URL e/ou SUPABASE_KEY');
  process.exit(1);
}

let content = fs.readFileSync(envFile, 'utf8');
content = content.replace('SUPABASE_URL_PLACEHOLDER', supabaseUrl);
content = content.replace('SUPABASE_KEY_PLACEHOLDER', supabaseKey);
fs.writeFileSync(envFile, content, 'utf8');

console.log('✅ Variáveis injetadas');
