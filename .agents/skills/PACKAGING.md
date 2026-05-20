# GoWild Admin Panel Skills — Packaging Notes

## Skills Packaged

| Skill File | Source Folder | Sidebar Section | Items Covered |
|------------|---------------|-----------------|---------------|
| `admin-store-section.skill` | `admin-store-section/` | Store | Dashboard, Products, Orders, Users |
| `admin-marketing-section.skill` | `admin-marketing-section/` | Marketing | Promotions, Promo Codes, Bundle Texts, Product Bundles |
| `admin-community-section.skill` | `admin-community-section/` | Community | Reviews |
| `admin-content-section.skill` | `admin-content-section/` | Content | Homepage, Categories, About Page, Navigation |
| `admin-system-section.skill` | `admin-system-section/` | System | Analytics, Settings |

## What Are These?

These are **Kimi skills** — modular knowledge packages that extend Kimi's capabilities for this project. Each `.skill` file is a ZIP archive containing a `SKILL.md` file with reference documentation about a specific admin panel section.

## How Skills Work

1. **Discovery**: Kimi scans `.agents/skills/` at session startup
2. **Metadata loading**: The `name` and `description` from each SKILL.md frontmatter are loaded into context
3. **Lazy loading**: The full SKILL.md body is only loaded when the skill is triggered by a relevant user query

## File Format

- `.skill` files are standard ZIP archives with a renamed extension
- Each contains a single `SKILL.md` file (Markdown with YAML frontmatter)
- Skills follow the Kimi skill specification from `skill-creator` built-in skill

## Installation / Sharing

### To install on another project:
1. Create `.agents/skills/` in the target project
2. Extract each `.skill` file (rename to `.zip` and unzip, or use `tar`/`unzip`)
3. Place the extracted folders in `.agents/skills/`

### To install at user-level (available across all projects):
- Extract to `~/.config/agents/skills/` (Linux/Mac)
- Or `~/.kimi/skills/`

## Verification

To verify a skill is valid:
1. Check that the folder contains `SKILL.md`
2. Verify YAML frontmatter has `name:` and `description:` fields
3. Ensure the description clearly states when the skill should be used

## Created

- **Date**: 2026-05-20
- **Project**: GoWild Outdoor Store
- **Location**: `.agents/skills/` (project-level)
