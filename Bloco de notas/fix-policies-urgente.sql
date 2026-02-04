-- 1. DROPAR TODAS AS POLICIES PROBLEMÁTICAS
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view their orgs" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated can create orgs" ON organizations;
DROP POLICY IF EXISTS "Owners can update organization" ON organizations;
DROP POLICY IF EXISTS "Owners can update orgs" ON organizations;

DROP POLICY IF EXISTS "Members can view org members" ON organization_members;
DROP POLICY IF EXISTS "Users can view own memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can create membership" ON organization_members;
DROP POLICY IF EXISTS "Users can insert membership" ON organization_members;
DROP POLICY IF EXISTS "Admins can delete members" ON organization_members;
DROP POLICY IF EXISTS "Users can delete own membership" ON organization_members;

-- 2. ORGANIZATION_MEMBERS - Policies SIMPLES (sem subquery que causa recursão)
CREATE POLICY "om_select" ON organization_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "om_insert" ON organization_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "om_delete" ON organization_members
  FOR DELETE USING (user_id = auth.uid());

-- 3. ORGANIZATIONS - Policies usando EXISTS (não causa recursão)
CREATE POLICY "org_select" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = id 
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_insert" ON organizations
  FOR INSERT WITH CHECK (true);  -- Qualquer autenticado pode criar

CREATE POLICY "org_update" ON organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = id 
      AND om.user_id = auth.uid() 
      AND om.role = 'owner'
    )
  );

-- 4. Verificar que RLS está habilitado
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
