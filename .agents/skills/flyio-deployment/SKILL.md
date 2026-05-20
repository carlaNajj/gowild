---
name: flyio-deployment
description: Reference for deploying the GoWild React + Vite SPA to Fly.io. Use when deploying, redeploying, scaling, debugging, or configuring CI/CD for the app.
---

# Fly.io Deployment

GoWild is deployed as a static SPA on Fly.io using nginx in a Docker container.

## Live URL

**https://gowild.fly.dev**

## Deployment Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build: Node.js builds the app → nginx serves `dist/` |
| `nginx.conf` | SPA fallback routing, gzip, cache headers, security headers |
| `fly.toml` | Fly app config: port 80, HTTPS, auto-stop/start, 1 machine |
| `.dockerignore` | Excludes `node_modules`, `.git`, env files from build context |
| `.github/workflows/deploy.yml` | GitHub Actions — auto-deploy on push to `main` |

## Quick Deploy

```bash
# Ensure flyctl is available
$env:Path += ";C:\Users\Victus\.fly\bin"

# Deploy current code
flyctl deploy
```

## First-Time Setup (Already Done)

```bash
# Install flyctl (Windows)
winget install FlyIO.flyctl

# Login
flyctl auth login

# Create app (if not exists)
flyctl apps create gowild

# Deploy
flyctl deploy
```

## Scaling

```bash
# Scale to 1 machine (recommended for static SPA)
flyctl scale count 1 --yes

# Scale VM size
flyctl scale vm shared-cpu-1x --memory 256
```

Current config: **1 machine**, `shared-cpu-1x`, `256MB RAM`, region `iad`.

## SSH Access (Debug Only)

```bash
# Interactive shell on running machine
flyctl ssh console

# Run a single command
flyctl ssh console -C "ls -la /usr/share/nginx/html"

# SFTP file transfer
flyctl ssh sftp shell
```

> SSH only works while machines are running. If auto-stopped, wake via `flyctl m start` or visit the URL first.

## GitHub Actions Auto-Deploy

1. Get a Fly.io API token:
   ```bash
   flyctl tokens create deploy -x 999999h
   ```

2. Add it to GitHub repo secrets as `FLY_API_TOKEN`

3. Push to `main` — the workflow in `.github/workflows/deploy.yml` handles the rest

## Monitoring

```bash
flyctl status          # App and machine status
flyctl logs            # Live logs
flyctl apps open       # Open URL in browser
flyctl metrics         # Resource usage
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Deploy fails with "non interactive" | Add `--yes` flag to commands |
| 404 on page refresh | `nginx.conf` handles SPA fallback via `try_files` |
| Images not loading | Ensure `public/` assets are copied; Vite `base: './'` uses relative paths |
| Machine won't SSH | Machine is auto-stopped; visit URL or `flyctl m start` first |
| "Could not find App" | Run `flyctl apps create gowild` |

## nginx.conf Key Settings

- **Port**: 80
- **SPA fallback**: `try_files $uri $uri/ /index.html`
- **Gzip**: enabled for JS, CSS, JSON, XML
- **Cache**: 1 year for static assets (images, fonts, JS, CSS)
- **Security headers**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy

## Dockerfile Build Stages

1. **Build stage** (`node:20-alpine`):
   - `npm ci`
   - `npm run build` (runs `tsc -b && vite build`)
   - Outputs to `dist/`

2. **Serve stage** (`nginx:alpine`):
   - Copies `dist/` → `/usr/share/nginx/html`
   - Copies `nginx.conf` → `/etc/nginx/conf.d/default.conf`
   - Image size: ~27 MB

## Notes

- `base: './'` in `vite.config.ts` means all assets use relative paths — works from any subdirectory
- `auto_stop_machines = 'stop'` in `fly.toml` stops the VM when idle (free tier friendly)
- `auto_start_machines = true` wakes it on incoming traffic
- Deploy uses remote builders — no Docker needed locally
