-- RLS audit checklist for Supabase projects
-- Run in Supabase SQL Editor.

-- 1) Tables in public schema with RLS disabled (should be empty for app tables)
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'r'
  and n.nspname = 'public'
  and c.relname not like 'pg_%'
  and c.relrowsecurity = false
order by 1, 2;

-- 2) Tables with RLS enabled but no policy (usually means all access is blocked)
-- Keep this list intentional and small.
with public_tables as (
  select c.oid, n.nspname as schema_name, c.relname as table_name
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where c.relkind = 'r'
    and n.nspname = 'public'
    and c.relname not like 'pg_%'
    and c.relrowsecurity = true
)
select pt.schema_name, pt.table_name
from public_tables pt
left join pg_policies p
  on p.schemaname = pt.schema_name
 and p.tablename = pt.table_name
where p.policyname is null
order by 1, 2;

-- 3) Full policy inventory for manual review
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
where schemaname = 'public'
order by tablename, policyname;

-- 4) Optional smoke checks (replace table name)
-- select count(*) from public.your_table; -- as current role
-- In Dashboard SQL editor you usually run as service role.
-- For true anon/authenticated behavior, test through the API with real JWTs.
