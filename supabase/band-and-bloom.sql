-- Band & Bloom en la misma Supabase que Mi Semana (proyecto mi-semana → SQL Editor).
-- Cada persona solo ve y cambia sus propios datos (RLS).

-- Ajustes, plan, recordatorios, notas y días de descanso: un documento por persona.
create table if not exists public.bb_datos (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  datos jsonb not null,
  actualizado timestamptz not null default now()
);
alter table public.bb_datos enable row level security;
drop policy if exists "mis datos de band and bloom" on public.bb_datos;
create policy "mis datos de band and bloom" on public.bb_datos
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Entrenamientos: una fila por sesión (la fase 5 las va guardando aquí).
create table if not exists public.bb_sesiones (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  routine_id text not null,
  fecha date not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  status text not null check (status in ('completed', 'ended-early')),
  completed_sets jsonb not null default '[]'::jsonb,
  note text,
  creada timestamptz not null default now()
);
create index if not exists bb_sesiones_usuario_fecha on public.bb_sesiones (user_id, fecha);
alter table public.bb_sesiones enable row level security;
drop policy if exists "mis sesiones de band and bloom" on public.bb_sesiones;
create policy "mis sesiones de band and bloom" on public.bb_sesiones
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
