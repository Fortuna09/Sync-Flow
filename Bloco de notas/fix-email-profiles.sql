-- ==========================================================
-- CORREÇÃO: ADICIONAR EMAIL NA TABELA PROFILES
-- Execute este script no SQL Editor do Supabase para corrigir
-- ==========================================================

-- 1. Adicionar coluna email na tabela profiles (se não existir)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Atualizar a função trigger para salvar o email automaticamente em NOVOS cadastros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, has_created_org)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email, -- Adicionando o email aqui
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Sincronizar os emails dos usuários que JÁ existem (Backfill)
-- Copia o email da tabela auth.users para a public.profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 4. Agora você pode consultar os usuários assim:
-- SELECT id, first_name, email FROM profiles;
