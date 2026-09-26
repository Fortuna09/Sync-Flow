-- Isolamento multi-tenant via Row Level Security.
-- Todo acesso a dados passa por organization_members: um usuário só enxerga
-- organizações das quais é membro, e tudo abaixo delas (boards, lists, cards, comments).

-- Quem criou a organização: permite ler a org logo após o insert (antes de existir a membership)
alter table public.organizations add column if not exists created_by uuid default auth.uid();

update public.organizations o
set created_by = m.user_id
from public.organization_members m
where m.organization_id = o.id and m.role = 'owner' and o.created_by is null;

-- Helpers fora do schema exposto pela API. SECURITY DEFINER evita recursão de RLS entre tabelas.
create schema if not exists private;

create or replace function private.is_org_member(p_org_id text, p_roles text[] default null)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = p_org_id
      and m.user_id = (select auth.uid())
      and (p_roles is null or m.role = any (p_roles))
  );
$$;

create or replace function private.shares_org_with(p_user_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members me
    join public.organization_members other on other.organization_id = me.organization_id
    where me.user_id = (select auth.uid()) and other.user_id = p_user_id
  );
$$;

create or replace function private.board_org(p_board_id integer)
returns text language sql stable security definer set search_path = '' as $$
  select organization_id from public.boards where id = p_board_id;
$$;

create or replace function private.list_org(p_list_id integer)
returns text language sql stable security definer set search_path = '' as $$
  select b.organization_id from public.lists l
  join public.boards b on b.id = l.board_id
  where l.id = p_list_id;
$$;

create or replace function private.card_org(p_card_id integer)
returns text language sql stable security definer set search_path = '' as $$
  select b.organization_id from public.cards c
  join public.lists l on l.id = c.list_id
  join public.boards b on b.id = l.board_id
  where c.id = p_card_id;
$$;

revoke all on schema private from public;
grant usage on schema private to authenticated;
revoke all on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;

-- Liga RLS em todas as tabelas expostas
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.boards enable row level security;
alter table public.lists enable row level security;
alter table public.cards enable row level security;
alter table public.comments enable row level security;

-- PROFILES
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or private.shares_org_with(id));
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- ORGANIZATIONS
create policy organizations_select on public.organizations for select to authenticated
  using (created_by = (select auth.uid()) or private.is_org_member(id));
create policy organizations_insert on public.organizations for insert to authenticated
  with check (created_by = (select auth.uid()));
create policy organizations_update on public.organizations for update to authenticated
  using (private.is_org_member(id, array['owner']))
  with check (private.is_org_member(id, array['owner']));

-- ORGANIZATION_MEMBERS
create policy members_select on public.organization_members for select to authenticated
  using (user_id = (select auth.uid()) or private.is_org_member(organization_id));
-- Só quem criou a org pode se adicionar como owner (convites ainda não existem no app)
create policy members_insert on public.organization_members for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and role = 'owner'
    and exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.created_by = (select auth.uid())
    )
  );
create policy members_delete on public.organization_members for delete to authenticated
  using (user_id = (select auth.uid()));

-- BOARDS
create policy boards_select on public.boards for select to authenticated
  using (private.is_org_member(organization_id));
create policy boards_insert on public.boards for insert to authenticated
  with check (private.is_org_member(organization_id, array['owner','admin','member']));
create policy boards_update on public.boards for update to authenticated
  using (private.is_org_member(organization_id, array['owner','admin','member']))
  with check (private.is_org_member(organization_id, array['owner','admin','member']));
create policy boards_delete on public.boards for delete to authenticated
  using (private.is_org_member(organization_id, array['owner','admin']));

-- LISTS
create policy lists_select on public.lists for select to authenticated
  using (private.is_org_member(private.board_org(board_id)));
create policy lists_insert on public.lists for insert to authenticated
  with check (private.is_org_member(private.board_org(board_id), array['owner','admin','member']));
create policy lists_update on public.lists for update to authenticated
  using (private.is_org_member(private.board_org(board_id), array['owner','admin','member']))
  with check (private.is_org_member(private.board_org(board_id), array['owner','admin','member']));
create policy lists_delete on public.lists for delete to authenticated
  using (private.is_org_member(private.board_org(board_id), array['owner','admin']));

-- CARDS
create policy cards_select on public.cards for select to authenticated
  using (private.is_org_member(private.list_org(list_id)));
create policy cards_insert on public.cards for insert to authenticated
  with check (private.is_org_member(private.list_org(list_id), array['owner','admin','member']));
create policy cards_update on public.cards for update to authenticated
  using (private.is_org_member(private.list_org(list_id), array['owner','admin','member']))
  with check (private.is_org_member(private.list_org(list_id), array['owner','admin','member']));
create policy cards_delete on public.cards for delete to authenticated
  using (private.is_org_member(private.list_org(list_id), array['owner','admin','member']));

-- COMMENTS
create policy comments_select on public.comments for select to authenticated
  using (private.is_org_member(private.card_org(card_id)));
create policy comments_insert on public.comments for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and private.is_org_member(private.card_org(card_id), array['owner','admin','member'])
  );
create policy comments_delete on public.comments for delete to authenticated
  using (
    user_id = (select auth.uid())
    or private.is_org_member(private.card_org(card_id), array['owner','admin'])
  );

-- Função do trigger não deve ser chamável via /rest/v1/rpc
revoke execute on function public.handle_new_user() from public, anon, authenticated;
