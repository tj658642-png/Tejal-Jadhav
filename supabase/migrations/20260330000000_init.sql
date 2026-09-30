-- AI Council schema
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  original_prompt text not null,
  task_type text not null,
  status text not null default 'queued',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.analysis_inputs (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  input_type text not null,
  file_name text,
  file_path text,
  mime_type text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  agent_name text not null,
  provider text not null,
  model text not null,
  status text not null,
  response text,
  execution_time_ms integer,
  token_usage integer,
  error text,
  created_at timestamptz not null default now()
);

create table if not exists public.final_results (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null unique references public.analyses(id) on delete cascade,
  summary text not null,
  consensus jsonb default '[]',
  disagreements jsonb default '[]',
  caveats jsonb default '[]',
  next_steps jsonb default '[]',
  confidence numeric,
  confidence_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  title text not null,
  url text,
  source_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_id uuid references public.analyses(id) on delete set null,
  provider text,
  model text,
  tokens integer,
  estimated_cost numeric,
  created_at timestamptz not null default now()
);

create index if not exists idx_analyses_user_id on public.analyses(user_id);
create index if not exists idx_analyses_created_at on public.analyses(created_at desc);
create index if not exists idx_agent_runs_analysis_id on public.agent_runs(analysis_id);
create index if not exists idx_usage_logs_user_id on public.usage_logs(user_id);

alter table public.profiles enable row level security;
alter table public.analyses enable row level security;
alter table public.analysis_inputs enable row level security;
alter table public.agent_runs enable row level security;
alter table public.final_results enable row level security;
alter table public.sources enable row level security;
alter table public.usage_logs enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

create policy "analyses_select_own" on public.analyses for select using (auth.uid() = user_id);
create policy "analyses_insert_own" on public.analyses for insert with check (auth.uid() = user_id);
create policy "analyses_update_own" on public.analyses for update using (auth.uid() = user_id);
create policy "analyses_delete_own" on public.analyses for delete using (auth.uid() = user_id);

create policy "analysis_inputs_select_own" on public.analysis_inputs for select using (
  exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = auth.uid())
);
create policy "analysis_inputs_insert_own" on public.analysis_inputs for insert with check (
  exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = auth.uid())
);

create policy "agent_runs_select_own" on public.agent_runs for select using (
  exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = auth.uid())
);

create policy "final_results_select_own" on public.final_results for select using (
  exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = auth.uid())
);

create policy "sources_select_own" on public.sources for select using (
  exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = auth.uid())
);

create policy "usage_logs_select_own" on public.usage_logs for select using (auth.uid() = user_id);
create policy "usage_logs_insert_own" on public.usage_logs for insert with check (auth.uid() = user_id);
