# Deployment Guide

The full deliverable checklist is in `docs/phases/phase-17-deployment.md`. This is the runbook.

---

## Read this first: the Hostinger constraint

**Hostinger shared hosting (Premium / Business web hosting) runs PHP and MySQL only. It cannot run
a Node.js process.** A server-rendered Next.js application will not work there. This is not a
configuration problem to solve — it is what those plans are.

**Production therefore needs a Hostinger VPS.**

| Plan | Spec | Verdict |
| --- | --- | --- |
| Shared (Premium / Business) | PHP + MySQL | ❌ Cannot run Nexivora |
| **VPS KVM 1** | 1 vCPU · 4 GB · 50 GB | Works. Tight once Postgres, Node and Nginx share it. |
| **VPS KVM 2** | 2 vCPU · 8 GB · 100 GB | ✅ **The recommendation.** Comfortable headroom for a pilot college. |
| VPS KVM 4 | 4 vCPU · 16 GB | Only once there are several colleges. |

Free alternatives that *do* run Node, if a VPS is not possible:

| Option | Free tier | Notes |
| --- | --- | --- |
| **Render** | 750 h/month web service | Sleeps when idle, ~30s cold start. Fine for a shared demo link. Pair with Neon for Postgres. |
| **Railway** | Trial credit, then usage-based | Simplest deploy of the four; includes Postgres. |
| **Fly.io** | Small free allowance | Global, more configuration, real Postgres. |
| **Koyeb** | One free service | Simple, generous enough for a demo. |
| **Neon** | Free Postgres, 0.5 GB | The database half of any of the above. Serverless, scales to zero. |

Last resort — static-exporting the public site onto shared hosting while the app runs elsewhere.
This splits the product, breaks shared navigation and session, and is not recommended.

---

## Stage 1 — Local development (and the demo)

**This is where the demo runs.** Local Postgres, seeded data, no network dependency, nothing on
venue wifi to fail.

```bash
cd Nexivora/app
npm install
cp .env.example .env          # fill in the values
npm run db:reset              # migrate + seed the demo college
npm run dev                   # http://localhost:3000
```

### PostgreSQL on Windows — two paths

**Path A — Docker (recommended, cleanest):**

```bash
docker run --name nexivora-db -e POSTGRES_PASSWORD=nexivora \
  -e POSTGRES_DB=nexivora -p 5432:5432 -d postgres:16
```

**Path B — the Windows installer** from postgresql.org. Install, note the superuser password,
then create the database and extensions:

```sql
CREATE DATABASE nexivora;
\c nexivora
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
```

Either way, `DATABASE_URL="postgresql://postgres:nexivora@localhost:5432/nexivora"`.

Reset to a clean demo state at any time:

```bash
npm run db:reset
```

LAN access, to show it on a phone:

```bash
npm run dev -- --hostname 0.0.0.0
# then http://<your-lan-ip>:3000
```

---

## Stage 2 — Sharing before production: Cloudflare Tunnel

Free, no account, no card, no deploy. Gives a public HTTPS URL in about five seconds that serves
the real application from your machine. Perfect for faculty review, testers and a live link in a
pitch email.

```bash
# install once: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
cloudflared tunnel --url http://localhost:3000
# → https://random-words-1234.trycloudflare.com
```

**Set `NEXT_PUBLIC_SITE_URL` to the tunnel URL** before starting the dev server, or every canonical
and OG URL will point at `localhost` and the shared link will look broken to anyone who inspects it.

The URL changes on every run. For a stable one, a named tunnel needs a free Cloudflare account and
a domain — worth doing once `nexivora.com` is bought.

---

## Stage 3 — Production on a Hostinger VPS

### 3.1 Provision

Ubuntu 24.04 LTS. From your machine:

```bash
ssh root@<vps-ip>
adduser nexivora && usermod -aG sudo nexivora
rsync --archive ~/.ssh/authorized_keys /home/nexivora/.ssh/   # key auth for the new user
```

Then harden, before anything else is installed:

```bash
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
systemctl restart ssh

ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
apt install -y fail2ban unattended-upgrades
```

### 3.2 Runtime

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs nginx postgresql-16 certbot python3-certbot-nginx
sudo npm install -g pm2
```

### 3.3 Database

```bash
sudo -u postgres psql
CREATE DATABASE nexivora;
CREATE USER nexivora_app WITH PASSWORD '<strong>';
GRANT CONNECT ON DATABASE nexivora TO nexivora_app;
\c nexivora
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
GRANT USAGE, CREATE ON SCHEMA public TO nexivora_app;
```

Confirm Postgres listens on localhost only (`listen_addresses = 'localhost'` in
`postgresql.conf`). It must never be reachable from the internet.

Migrations run as a separate elevated user; the application user cannot create extensions or drop
tables. That separation is in `docs/SECURITY.md` §9 and it is worth the five minutes.

### 3.4 Deploy

```bash
sudo -iu nexivora
git clone <repo> /home/nexivora/app && cd /home/nexivora/app/app
npm ci
cp .env.example .env && nano .env      # production values, NODE_ENV=production
npx prisma migrate deploy
npm run build
pm2 start npm --name nexivora -- start
pm2 save && pm2 startup                # survives reboot
```

`next.config.ts` sets `output: 'standalone'`, so the built server carries only what it needs.

### 3.5 Nginx

```nginx
server {
  server_name nexivora.com www.nexivora.com;

  gzip on;  gzip_types text/css application/javascript application/json image/svg+xml;
  client_max_body_size 30M;                 # must exceed the 25MB upload cap

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Server-Sent Events — buffering here is the classic production bug.
  # Without these three lines notifications arrive in batches, or not at all.
  location /api/sse {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Connection '';
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 24h;
  }

  location /_next/static/ {
    proxy_pass http://127.0.0.1:3000;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
}
```

```bash
sudo certbot --nginx -d nexivora.com -d www.nexivora.com
```

Certbot installs a renewal timer. Verify it with `systemctl list-timers | grep certbot` rather than
assuming.

### 3.6 Backups — and a tested restore

```bash
# /home/nexivora/backup.sh, nightly at 02:00 via cron
pg_dump nexivora | gzip > /home/nexivora/backups/db-$(date +%F).sql.gz
tar czf /home/nexivora/backups/files-$(date +%F).tar.gz /home/nexivora/uploads
find /home/nexivora/backups -mtime +14 -delete
# then push off-box — Cloudflare R2 free tier via rclone
rclone copy /home/nexivora/backups r2:nexivora-backups
```

**A backup you have not restored is not a backup.** Phase 17 is not complete until a restore has
been performed into a scratch database and the app has been booted against it.

---

## Environment matrix

| Variable | Dev | Production |
| --- | --- | --- |
| `NODE_ENV` | `development` | `production` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://nexivora.com` |
| `DATABASE_URL` | local Postgres | localhost Postgres on the VPS |
| `AUTH_SECRET` | any dev string | 32+ random bytes, unique |
| `AUTH_URL` | `http://localhost:3000` | `https://nexivora.com` |
| `EMAIL_TRANSPORT` | `console` | `smtp` |
| `SMTP_*` | unset | Hostinger SMTP or Brevo |
| `UPLOAD_DIR` | `./.uploads` | `/home/nexivora/uploads` |
| `STORAGE_DRIVER` | `local` | `local` (→ `r2` later) |
| `AI_ENABLED` | `false` | `false` until Phase 18 |
| `ANTHROPIC_API_KEY` | unset | set only when `AI_ENABLED=true` |
| `RATE_LIMIT_ENABLED` | `false` | `true` |

**`NEXT_PUBLIC_SITE_URL` is load-bearing** — canonicals, sitemap entries, OG image URLs and auth
callbacks all derive from it. Getting it wrong in production means every canonical points at
localhost, which is the most damaging single SEO mistake available.

---

## CI (GitHub Actions, Phase 17)

On every push: `npm ci` → `typecheck` → `lint` → `test` → `build`. On a tagged release, additionally
SSH to the VPS and run the deploy script. Nothing deploys that has not built.

## Deploy checklist

- [ ] `npm run check` clean locally
- [ ] Migrations reviewed — no destructive change without an explicit, backed-up plan
- [ ] `.env` on the server updated for any new variable
- [ ] `NEXT_PUBLIC_SITE_URL` is the production host
- [ ] **`robots.txt` does not contain `Disallow: /`** — check it after deploy, on the live host
- [ ] `pm2 reload nexivora` (reload, not restart — zero downtime)
- [ ] `/api/health` returns 200
- [ ] Sitemap loads and contains only public URLs
- [ ] SSE connects — open two browsers and verify a notification arrives without a refresh
- [ ] A file upload and download round-trips
- [ ] Backup ran last night and the file is non-trivially sized

## Rollback

```bash
cd /home/nexivora/app && git checkout <previous-tag>
cd app && npm ci && npm run build && pm2 reload nexivora
```

Under two minutes. **Database migrations do not roll back automatically** — a destructive migration
needs the backup, which is why every migration is reviewed before it is applied.
