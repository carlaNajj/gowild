# GoWild Admin Panel — Hostinger Deployment Guide

## Build Output

The project builds to a static site in the `dist/` folder.

```bash
npm run build
```

This runs TypeScript compilation (`tsc -b`) and Vite production build.

## Hostinger Shared Hosting Deployment

### Option 1: File Manager Upload (Recommended)

1. Run `npm run build` locally
2. Open Hostinger **File Manager** (or connect via FTP)
3. Navigate to `public_html/` (or your subdomain folder)
4. **Delete** existing files in `public_html/` (backup first if needed)
5. **Upload** the contents of the `dist/` folder (not the folder itself, but everything inside it)
6. Ensure `index.html` is at the root of `public_html/`

### Option 2: Git + Auto-Deploy (Advanced)

If your Hostinger plan supports Git:

1. Push your code to a Git repository
2. Connect the repo in Hostinger's Git section
3. Set build command: `npm run build`
4. Set publish directory: `dist`

## Important Notes

- **No backend required** — This is a static React SPA. All data is stored in the browser's `localStorage`.
- **Admin URL**: `yourdomain.com/admin`
- **Admin Login**: `admin@gowild.com` (any password with 4+ characters works for demo)
- **Relative paths**: The build uses `base: './'` so it works from any subdirectory

## Post-Deployment

1. Visit `yourdomain.com/admin`
2. Log in with admin credentials
3. Start managing products, orders, users, and site settings

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blank page after upload | Check that all `dist/` files were uploaded, especially `index.html` and the `assets/` folder |
| 404 on refresh | Add a `.htaccess` file in `public_html/` with rewrite rules (see below) |
| Images not loading | Ensure image files in `public/` folder were also uploaded if referenced by absolute path |

### .htaccess for SPA Routing

Create `public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

This ensures React Router works correctly when refreshing pages or accessing deep links like `/admin`.

---

## Fly.io Deployment

The project includes ready-to-use Fly.io configuration files: `Dockerfile`, `nginx.conf`, `fly.toml`, and `.dockerignore`.

### Prerequisites

1. Install `flyctl`:
   ```powershell
   # Windows (PowerShell)
   winget install FlyIO.flyctl
   # Or via PowerShell script:
   pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. Login to Fly.io:
   ```bash
   fly auth login
   ```

### Deploy

1. **Launch the app** (first time only):
   ```bash
   fly launch
   ```
   - This will detect the `Dockerfile` and create the app
   - A `fly.toml` is already provided; you can accept or customize settings

2. **Deploy updates**:
   ```bash
   fly deploy
   ```

3. **Open the app**:
   ```bash
   fly apps open
   ```

### Live URL

**https://gowild.fly.dev**

### SSH Access (Debug Only)

Connect to a running machine for debugging:
```bash
fly ssh console
```

Run a command without entering an interactive shell:
```bash
fly ssh console -C "ls -la /usr/share/nginx/html"
```

Transfer files via SFTP:
```bash
fly ssh sftp shell
```

> **Note:** SSH only works while machines are running. If `auto_stop_machines` is enabled, wake the app first by visiting its URL or run `fly m start`.

### Fly.io Configuration Details

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build: Node.js builds the app, nginx serves static files |
| `nginx.conf` | SPA fallback routing (`try_files`), gzip, caching headers |
| `fly.toml` | Fly app config: port 80, HTTPS, auto-stop/start machines |
| `.dockerignore` | Excludes `node_modules`, `.git`, local env files from build context |

### Scaling

Scale to 2 machines for high availability:
```bash
fly scale count 2
```

Scale VM size:
```bash
fly scale vm shared-cpu-1x --memory 512
```

### Custom Domain

```bash
fly certs create yourdomain.com
```

Then point your DNS CNAME record to `gowild.fly.dev`.

### Monitoring

```bash
fly status          # App status
fly logs            # Live logs
fly metrics         # Resource usage
```
