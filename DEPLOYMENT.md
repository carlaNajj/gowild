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
