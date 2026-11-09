-- Insights (blog) schema, from the "Blog database and SEO build checklist" doc (8 Nov 2026).
-- The site reads published posts with the anon key at build time; writes use the service role.
create extension if not exists pgcrypto;

create table public.posts (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status              text not null default 'draft'
                        check (status in ('draft','scheduled','published','archived')),
  title               text not null,
  meta_title          text not null check (char_length(meta_title) <= 60),
  meta_description    text not null check (char_length(meta_description) between 120 and 160),
  excerpt             text not null check (char_length(excerpt) <= 200),
  body_md             text not null,
  cluster             text not null,
  is_pillar           boolean not null default false,
  primary_keyword     text not null,
  secondary_keywords  text[] not null default '{}',
  faq                 jsonb not null default '[]'::jsonb,
  related_slugs       text[] not null default '{}',
  featured_image_url  text,
  featured_image_alt  text,
  author_name         text not null default 'Dan Kovac',
  reading_minutes     int,
  publish_at          timestamptz,
  published_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  linkedin_post_text  text,
  linkedin_post_urn   text,
  linkedin_shared_at  timestamptz,
  carousel_pdf_url    text,
  carousel_post_text  text,
  carousel_publish_at timestamptz,
  carousel_post_urn   text
);

create table public.post_briefs (
  post_id     uuid primary key references public.posts(id) on delete cascade,
  transcript  text,
  brief       text,
  created_at  timestamptz not null default now()
);

create index posts_status_publish_at on public.posts (status, publish_at);
create index posts_cluster on public.posts (cluster);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

alter table public.posts enable row level security;
alter table public.post_briefs enable row level security;

create policy "public reads published posts" on public.posts
  for select to anon, authenticated using (status = 'published');

insert into storage.buckets (id, name, public) values ('blog-media', 'blog-media', true)
  on conflict (id) do nothing;
