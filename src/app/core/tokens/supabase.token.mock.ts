/**
 * Mock mínimo de SupabaseClient para testes unitários.
 * Evita instanciar um client real (que trava em Chrome headless disputando
 * o Navigator LockManager do @supabase/auth-js) sem precisar mockar
 * AuthService inteiro em specs que só precisam que ele não lance erro.
 */
export function createMockSupabaseClient() {
  return {
    auth: {
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } }
      }),
      signInWithPassword: () => Promise.resolve({ error: null }),
      signUp: () => Promise.resolve({ error: null }),
      signOut: () => Promise.resolve({ error: null })
    }
  };
}
