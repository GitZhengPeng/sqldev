-- RLS audit checklist for Supabase projects
-- Run in Supabase SQL Editor.
--
-- Default target schemas: public + app
-- If your business tables are elsewhere, edit every target_schemas CTE.

-- 0) Session context
select
  current_user as db_user,
  current_role as db_role,
  current_setting('role', true) as active_role;

-- 1) Baseline: business tables in target schemas
with target_schemas as (
  select unnest(array['public', 'app']) as schema_name
)
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
join target_schemas t on t.schema_name = n.nspname
where c.relkind = 'r'
order by 1, 2;

-- 2) RLS disabled tables in target schemas (should be empty)
with target_schemas as (
  select unnest(array['public', 'app']) as schema_name
)
select
  n.nspname as schema_name,
  c.relname as table_name
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
join target_schemas t on t.schema_name = n.nspname
where c.relkind = 'r'
  and c.relrowsecurity = false
order by 1, 2;

-- 3) Tables with RLS enabled but no policy
with target_schemas as (
  select unnest(array['public', 'app']) as schema_name
),
target_tables as (
  select c.oid, n.nspname as schema_name, c.relname as table_name
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  join target_schemas t on t.schema_name = n.nspname
  where c.relkind = 'r'
    and c.relrowsecurity = true
)
select tt.schema_name, tt.table_name
from target_tables tt
left join pg_policies p
  on p.schemaname = tt.schema_name
 and p.tablename = tt.table_name
where p.policyname is null
order by 1, 2;

-- 4) Full policy inventory for target schemas
with target_schemas as (
  select unnest(array['public', 'app']) as schema_name
)
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  coalesce(qual, 'NULL') as using_expr,
  coalesce(with_check, 'NULL') as check_expr
from pg_policies
where schemaname in (select schema_name from target_schemas)
order by schemaname, tablename, policyname;

-- 5) Supabase managed schemas: info only (do not treat as app risk list)
select
  n.nspname as schema_name,
  count(*) as table_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'r'
  and n.nspname in ('auth', 'realtime', 'storage')
group by n.nspname
order by n.nspname;

-- 6) Storage-specific check (if you use Supabase Storage)
-- storage.objects should have policies for intended read/write behavior.
select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
order by policyname;

-- 7) Optional: table count for target schemas
with target_schemas as (
  select unnest(array['public', 'app']) as schema_name
)
select
  n.nspname as schema_name,
  count(*) as table_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
join target_schemas t on t.schema_name = n.nspname
where c.relkind = 'r'
group by n.nspname
order by n.nspname;
