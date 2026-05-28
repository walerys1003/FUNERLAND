# Coolify Deployment Guide — PolskiePogrzeby.pl

## Prerequisites

- VPS z 8GB RAM + 4 vCPU + 80GB SSD (rekomendacja: Hetzner CCX23 lub Contabo VDS L)
- Domena `polskiepogrzeby.pl` skierowana na IP serwera (A + AAAA)
- Cloudflare jako CDN (Full SSL strict mode)

## Installation

### 1. Install Coolify on server

```bash
ssh root@your-server-ip
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

Po instalacji → `https://your-server-ip:8000` → create admin user.

### 2. Setup GitHub source

W Coolify UI:
- **Sources** → Add GitHub
- Connect via OAuth (lub fine-grained PAT z perms: contents:read)
- Authorize repo `walerys1003/FUNERLAND`

### 3. Create Application

- **Name:** polskiepogrzeby-app
- **Source:** GitHub → walerys1003/FUNERLAND (branch: main)
- **Build pack:** Dockerfile
- **Dockerfile location:** `/Dockerfile`
- **Port:** 3000
- **Domains:** `polskiepogrzeby.pl, www.polskiepogrzeby.pl`
- **HTTPS:** Let's Encrypt (auto)

### 4. Environment Variables

Copy from `.env.example` and fill production values:

```
NEXT_PUBLIC_SITE_URL=https://polskiepogrzeby.pl
NEXT_PUBLIC_SUPABASE_URL=https://supabase.polskiepogrzeby.pl
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
P24_MERCHANT_ID=...
P24_API_KEY=...
RESEND_API_KEY=re_...
SMSAPI_TOKEN=...
OPENAI_API_KEY=sk-proj-...
MEILISEARCH_HOST=http://meilisearch:7700
MEILISEARCH_API_KEY=...
```

### 5. Companion services

W Coolify → **Services** dodaj:

- **Supabase self-hosted** (template) — Studio + Auth + Postgres + Storage + Realtime
- **Meilisearch** (Docker image: getmeili/meilisearch:v1.10)
- **Redis** (Docker image: redis:7-alpine)
- **MinIO** (Docker image: minio/minio)
- **Plausible** (Docker image: plausible/community-edition)
- **Uptime Kuma** (monitoring)

### 6. Webhook deployment

Coolify generuje webhook URL → dodaj jako secret w GitHub:
- Settings → Secrets → `COOLIFY_WEBHOOK_URL`
- Settings → Secrets → `COOLIFY_DEPLOY_TOKEN`

Workflow `.github/workflows/docker-build.yml` automatycznie deployuje na push do `main`.

### 7. Backups

W Coolify → Database (Postgres) → **Backups** → Schedule:
- Daily 03:00 → S3 (MinIO bucket `pp-backups`)
- Weekly 04:00 Sunday → offsite (Backblaze B2)
- Retention: 7 days daily, 4 weeks weekly, 6 months monthly

### 8. Monitoring

- Coolify → Resources → CPU/RAM/Disk alerts (>80% trigger Telegram)
- Uptime Kuma → monitor `https://polskiepogrzeby.pl/api/health` co 60s
- Sentry → already integrated via env var
- Plausible → traffic dashboard

## Rollback

```bash
# Via Coolify UI:
# Applications → polskiepogrzeby-app → Deployments → click [Rollback] on previous build

# Or via CLI:
docker service update --rollback pp-app
```

## Disaster Recovery

1. **DB corruption** → restore from last backup (Coolify → Database → Restore)
2. **Server down** → spin up new server, run install script, attach S3 backups, restore
3. **DNS hijack** → switch Cloudflare nameservers, push HSTS preload list
4. **DDoS** → enable Cloudflare "Under Attack mode" + rate limit
