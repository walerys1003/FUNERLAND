-- 0001_extensions.sql
-- Required Postgres extensions for the marketplace.
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "citext";
create extension if not exists "pg_trgm";
-- PostGIS for geo (latitude/longitude radius search)
create extension if not exists "postgis";
-- pgvector for AI embeddings (1536-dim from OpenAI text-embedding-3-small)
create extension if not exists "vector";
