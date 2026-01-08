-- =====================================================
-- QUERIES SUPABASE - ESTRUTURA COMPLETA DO SYNCFLOW
-- Execute em ordem no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- PARTE 0: TABELA DE PROFILES (extensão do auth.users)
-- =====================================================

-- Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  has_created_org BOOLEAN DEFAULT false,  -- Flag: já criou primeira organização?
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar coluna has_created_org se tabela já existir
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS has_created_org BOOLEAN DEFAULT false;

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Trigger para criar profile automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, has_created_org)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger se existir e recriar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PARTE 1: CRIAR TABELAS DE ORGANIZAÇÃO
-- =====================================================

-- Tabela de organizações
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_personal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de membros da organização
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- =====================================================
-- PARTE 2: ADICIONAR COLUNAS NAS TABELAS EXISTENTES
-- =====================================================

-- Adicionar organization_id na tabela boards
ALTER TABLE boards 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Adicionar created_by na tabela lists
ALTER TABLE lists 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Adicionar created_by na tabela cards
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- =====================================================
-- PARTE 3: HABILITAR RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 4: POLICIES PARA ORGANIZATIONS
-- =====================================================

-- Remover policies existentes (se houver)
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Owners can update organization" ON organizations;

-- Usuários podem ver organizações das quais são membros
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Usuários autenticados podem criar organizações
CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Apenas owners podem atualizar a organização
CREATE POLICY "Owners can update organization" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- =====================================================
-- PARTE 5: POLICIES PARA ORGANIZATION_MEMBERS
-- =====================================================

-- Remover policies existentes (se houver)
DROP POLICY IF EXISTS "Members can view org members" ON organization_members;
DROP POLICY IF EXISTS "Users can create membership" ON organization_members;
DROP POLICY IF EXISTS "Admins can delete members" ON organization_members;

-- Usuários podem ver memberships onde são membros (SEM RECURSÃO)
CREATE POLICY "Members can view org members" ON organization_members
  FOR SELECT USING (user_id = auth.uid());

-- Usuários autenticados podem criar membership (para si mesmos como owner)
CREATE POLICY "Users can create membership" ON organization_members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Usuários podem deletar suas próprias memberships OU admins/owners podem deletar outros
CREATE POLICY "Admins can delete members" ON organization_members
  FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- PARTE 6: POLICIES PARA BOARDS
-- =====================================================

-- Remover policies existentes (se houver)
DROP POLICY IF EXISTS "Org members can view boards" ON boards;
DROP POLICY IF EXISTS "Members can create boards" ON boards;
DROP POLICY IF EXISTS "Members can update boards" ON boards;
DROP POLICY IF EXISTS "Admins can delete boards" ON boards;

-- Membros da org podem ver boards da org
CREATE POLICY "Org members can view boards" ON boards
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Membros (exceto viewer) podem criar boards
CREATE POLICY "Members can create boards" ON boards
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

-- Owner/admin/member podem atualizar boards
CREATE POLICY "Members can update boards" ON boards
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

-- Owner/admin podem deletar boards
CREATE POLICY "Admins can delete boards" ON boards
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- PARTE 7: POLICIES PARA LISTS
-- =====================================================

-- Remover policies existentes (se houver)
DROP POLICY IF EXISTS "Org members can view lists" ON lists;
DROP POLICY IF EXISTS "Members can create lists" ON lists;
DROP POLICY IF EXISTS "Members can update lists" ON lists;
DROP POLICY IF EXISTS "Admins can delete lists" ON lists;

-- Membros da org podem ver listas (via board -> org)
CREATE POLICY "Org members can view lists" ON lists
  FOR SELECT USING (
    board_id IN (
      SELECT id FROM boards WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Membros podem criar listas
CREATE POLICY "Members can create lists" ON lists
  FOR INSERT WITH CHECK (
    board_id IN (
      SELECT id FROM boards WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
      )
    )
  );

-- Membros podem atualizar listas
CREATE POLICY "Members can update lists" ON lists
  FOR UPDATE USING (
    board_id IN (
      SELECT id FROM boards WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
      )
    )
  );

-- Admin/owner podem deletar listas
CREATE POLICY "Admins can delete lists" ON lists
  FOR DELETE USING (
    board_id IN (
      SELECT id FROM boards WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- =====================================================
-- PARTE 8: POLICIES PARA CARDS
-- =====================================================

-- Remover policies existentes (se houver)
DROP POLICY IF EXISTS "Org members can view cards" ON cards;
DROP POLICY IF EXISTS "Members can create cards" ON cards;
DROP POLICY IF EXISTS "Members can update cards" ON cards;
DROP POLICY IF EXISTS "Members can delete cards" ON cards;

-- Membros da org podem ver cards
CREATE POLICY "Org members can view cards" ON cards
  FOR SELECT USING (
    list_id IN (
      SELECT id FROM lists WHERE board_id IN (
        SELECT id FROM boards WHERE organization_id IN (
          SELECT organization_id FROM organization_members 
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Membros podem criar cards
CREATE POLICY "Members can create cards" ON cards
  FOR INSERT WITH CHECK (
    list_id IN (
      SELECT id FROM lists WHERE board_id IN (
        SELECT id FROM boards WHERE organization_id IN (
          SELECT organization_id FROM organization_members 
          WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

-- Membros podem atualizar cards
CREATE POLICY "Members can update cards" ON cards
  FOR UPDATE USING (
    list_id IN (
      SELECT id FROM lists WHERE board_id IN (
        SELECT id FROM boards WHERE organization_id IN (
          SELECT organization_id FROM organization_members 
          WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

-- Membros podem deletar cards
CREATE POLICY "Members can delete cards" ON cards
  FOR DELETE USING (
    list_id IN (
      SELECT id FROM lists WHERE board_id IN (
        SELECT id FROM boards WHERE organization_id IN (
          SELECT organization_id FROM organization_members 
          WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
        )
      )
    )
  );

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_boards_org ON boards(organization_id);
CREATE INDEX IF NOT EXISTS idx_lists_board ON lists(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_list ON cards(list_id);
