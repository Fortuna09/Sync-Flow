/**
 * Production environment configuration.
 * 
 * IMPORTANT: Do not commit real credentials to this file!
 * These placeholder values are replaced during CI/CD build.
 * 
 * For CI/CD (Vercel/GitHub Actions):
 * 1. Set SUPABASE_URL and SUPABASE_KEY in your CI environment variables
 * 2. Use the set-env script before build: npm run set-env && npm run build
 */
export const environment = {
  production: true,
  supabaseUrl: 'SUPABASE_URL_PLACEHOLDER',
  supabaseKey: 'SUPABASE_KEY_PLACEHOLDER'
};