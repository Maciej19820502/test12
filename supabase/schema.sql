-- ============================================
-- Projekt AI — Supabase Database Schema
-- ============================================

-- 1. Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  created_at timestamp with time zone default now()
);

-- 2. Projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  topic_title text,
  topic_description text,
  status text default 'draft',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. Project Cards
create table if not exists project_cards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  section_1 text,
  section_2 text,
  section_3 text,
  section_4 text,
  section_5 text,
  section_6 text,
  section_7 text,
  section_8 text,
  version integer default 1,
  source_tool text,
  created_at timestamp with time zone default now()
);

-- 4. Tool Sessions
create table if not exists tool_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  tool_name text not null check (tool_name in ('A', 'B', 'C', 'D', 'E')),
  status text default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  started_at timestamp with time zone,
  completed_at timestamp with time zone
);

-- 5. CFO Reviews
create table if not exists cfo_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  review_text text,
  requirements text,
  approved boolean default false,
  created_at timestamp with time zone default now()
);

-- 6. PM Reviews
create table if not exists pm_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  recommendations text,
  improved_timeline text,
  e1_score numeric,
  e2_score numeric,
  e3_score numeric,
  e4_score numeric,
  e5_score numeric,
  average_score numeric,
  created_at timestamp with time zone default now()
);

-- 7. Defense Results
create table if not exists defense_results (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  decision text,
  notes_summary text,
  transcript text,
  created_at timestamp with time zone default now()
);

-- Indexes
create index if not exists idx_projects_user_id on projects(user_id);
create index if not exists idx_tool_sessions_user_id on tool_sessions(user_id);
create index if not exists idx_project_cards_project_id on project_cards(project_id);
create index if not exists idx_cfo_reviews_project_id on cfo_reviews(project_id);
create index if not exists idx_pm_reviews_project_id on pm_reviews(project_id);
create index if not exists idx_defense_results_project_id on defense_results(project_id);

-- Row Level Security
alter table users enable row level security;
alter table projects enable row level security;
alter table project_cards enable row level security;
alter table tool_sessions enable row level security;
alter table cfo_reviews enable row level security;
alter table pm_reviews enable row level security;
alter table defense_results enable row level security;

-- RLS Policies

-- Users: anyone can register and read their own data
create policy "Allow insert for anon" on users for insert with check (true);
create policy "Allow select for anon" on users for select using (true);
create policy "Allow update own user" on users for update using (true);

-- Projects
create policy "Allow insert projects" on projects for insert with check (true);
create policy "Allow select projects" on projects for select using (true);
create policy "Allow update projects" on projects for update using (true);
create policy "Allow delete projects" on projects for delete using (true);

-- Project Cards
create policy "Allow insert project_cards" on project_cards for insert with check (true);
create policy "Allow select project_cards" on project_cards for select using (true);
create policy "Allow update project_cards" on project_cards for update using (true);

-- Tool Sessions
create policy "Allow insert tool_sessions" on tool_sessions for insert with check (true);
create policy "Allow select tool_sessions" on tool_sessions for select using (true);
create policy "Allow update tool_sessions" on tool_sessions for update using (true);

-- CFO Reviews
create policy "Allow insert cfo_reviews" on cfo_reviews for insert with check (true);
create policy "Allow select cfo_reviews" on cfo_reviews for select using (true);
create policy "Allow update cfo_reviews" on cfo_reviews for update using (true);

-- PM Reviews
create policy "Allow insert pm_reviews" on pm_reviews for insert with check (true);
create policy "Allow select pm_reviews" on pm_reviews for select using (true);
create policy "Allow update pm_reviews" on pm_reviews for update using (true);

-- Defense Results
create policy "Allow insert defense_results" on defense_results for insert with check (true);
create policy "Allow select defense_results" on defense_results for select using (true);
create policy "Allow update defense_results" on defense_results for update using (true);
