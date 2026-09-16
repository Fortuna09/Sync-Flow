/**
 * Produção - placeholders substituídos em build time pelo scripts/set-env.js
 * (npm run build:prod), a partir das env vars SUPABASE_URL / SUPABASE_KEY
 * configuradas no Vercel. NUNCA commitar valores reais aqui.
 *
 * IMPORTANTE: supabaseKey deve ser a chave "anon"/"public" do Supabase,
 * nunca a "service_role" — a service_role ignora as políticas de RLS e
 * não pode circular no bundle do client.
 */
export const environment = {
  production: true,
  supabaseUrl: 'SUPABASE_URL_PLACEHOLDER',
  supabaseKey: 'SUPABASE_KEY_PLACEHOLDER'
};
