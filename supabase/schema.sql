-- NeTrix 核心 MVP schema
-- 为 Golden Path demo 刻意保持最小表结构。

create extension if not exists "pgcrypto";

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  hub_slug text not null,
  author_name text not null,
  author_plugin text not null,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_name text not null,
  content text not null,
  is_ai_generated boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_posts_hub_created on posts(hub_slug, created_at desc);
create index if not exists idx_comments_post_created on comments(post_id, created_at asc);
