-- Fursa database. Supabase dashboard > SQL Editor > New query > paste all > Run.

create table organizations (
  id bigint generated always as identity primary key,
  name text not null unique,
  website text,
  logo_url text,
  created_at timestamptz default now()
);

create table opportunities (
  id bigint generated always as identity primary key,
  org_id bigint not null references organizations(id) on delete cascade,
  title text not null,
  category text not null check (category in ('Course','Training','Internship','Scholarship')),
  description text not null,
  location text not null,
  deadline date,                -- null = self-paced / always open
  apply_url text not null,
  source_url text unique,       -- page the scraper took it from; used to upsert without duplicates
  featured boolean default false,
  published boolean default true,
  created_at timestamptz default now()
);
create index on opportunities (deadline);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  email_notifications boolean default true,
  created_at timestamptz default now()
);

create table subscribers (
  id bigint generated always as identity primary key,
  email text not null unique check (email ~* '^\S+@\S+\.\S+$'),
  created_at timestamptz default now()
);

create table support_messages (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('contact','report')),
  name text,
  email text not null,
  message text not null check (char_length(message) between 10 and 4000),
  created_at timestamptz default now()
);

-- Create a profile automatically for every new account
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- Google sign-in fills full_name and avatar_url in raw_user_meta_data
  insert into profiles (id, full_name, avatar_url)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
          new.raw_user_meta_data->>'avatar_url');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Security: row level security on every table
alter table organizations enable row level security;
alter table opportunities enable row level security;
alter table profiles enable row level security;
alter table subscribers enable row level security;
alter table support_messages enable row level security;

create policy "anyone reads organizations" on organizations for select using (true);
create policy "anyone reads published opportunities" on opportunities for select using (published);
create policy "read own profile" on profiles for select using (auth.uid() = id);
create policy "update own profile" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "anyone can subscribe" on subscribers for insert with check (true);
create policy "anyone can write to support" on support_messages for insert with check (true);
-- No select policy on subscribers / support_messages: only you (dashboard) can read them.

-- Public counters for the home page (counts only, no personal data)
create function get_stats() returns json language sql security definer set search_path = public as $$
  select json_build_object(
    'opportunities', (select count(*) from opportunities where published),
    'students', (select count(*) from profiles),
    'partners', (select count(*) from organizations));
$$;
grant execute on function get_stats() to anon, authenticated;

-- Lets a signed-in student delete their own account
create function delete_my_account() returns void language sql security definer set search_path = public, auth as $$
  delete from auth.users where id = auth.uid();
$$;
revoke execute on function delete_my_account() from public, anon;
grant execute on function delete_my_account() to authenticated;

-- Profile pictures
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
create policy "avatars public read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars own upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars own update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Sample data (delete when you add real listings)
insert into organizations (name) values ('Beirut Digital Lab'), ('Cedar Youth Network'), ('Green Lebanon'), ('Rise Foundation'), ('Bekaa Learning Hub');

insert into opportunities (org_id, title, category, description, location, deadline, apply_url, featured) values
  ((select id from organizations where name = 'Beirut Digital Lab'), 'Web Development Bootcamp', 'Course', 'Twelve free weekend sessions covering HTML, CSS and JavaScript.', 'Beirut / Online', '2026-10-25', 'https://example.org/apply/web', true),
  ((select id from organizations where name = 'Cedar Youth Network'), 'Youth Leadership Training', 'Training', 'Three-day workshop on teamwork, public speaking and project planning.', 'Tripoli', '2026-10-18', 'https://example.org/apply/leadership', true),
  ((select id from organizations where name = 'Green Lebanon'), 'Summer Program Internship', 'Internship', 'Support field teams on reforestation and community awareness campaigns.', 'Saida', '2026-11-10', 'https://example.org/apply/intern', true),
  ((select id from organizations where name = 'Rise Foundation'), 'Undergraduate Merit Scholarship', 'Scholarship', 'Covers tuition for students with strong grades and financial need.', 'Anywhere in Lebanon', '2026-12-01', 'https://example.org/apply/scholar', false),
  ((select id from organizations where name = 'Bekaa Learning Hub'), 'English for Work', 'Course', 'Free B1–B2 English classes focused on interviews and workplace writing.', 'Zahle', '2026-10-30', 'https://example.org/apply/english', false),
  ((select id from organizations where name = 'Beirut Digital Lab'), 'Data Analysis with Excel', 'Training', 'Learn pivot tables, charts and basic dashboards in four evenings.', 'Online', '2026-11-05', 'https://example.org/apply/excel', false),
  ((select id from organizations where name = 'Cedar Youth Network'), 'NGO Communications Internship', 'Internship', 'Help write stories and manage social media for youth programs.', 'Beirut', '2026-11-20', 'https://example.org/apply/comms', false),
  ((select id from organizations where name = 'Rise Foundation'), 'Women in STEM Scholarship', 'Scholarship', 'Financial support for female students in science and engineering.', 'Anywhere in Lebanon', '2026-12-15', 'https://example.org/apply/stem', false);