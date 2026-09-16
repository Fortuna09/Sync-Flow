// Ambiente usado só por `ng test` (local e CI). Valores fictícios, não são
// credenciais reais — servem apenas para o SupabaseClient ser instanciado
// sem lançar erro de URL inválida. Seguro de commitar, ao contrário de
// environment.development.ts (que é gitignored e fica com dados reais).
export const environment = {
  production: false,
  supabaseUrl: 'https://test-placeholder.supabase.co',
  supabaseKey: 'test-placeholder-key'
};
