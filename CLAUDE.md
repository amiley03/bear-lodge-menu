# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bear Lodge Inn is a static web menu application for Larry, designed around specific dietary restrictions (portal hypertension, gastroparesis, esophageal varices). The menu displays recipes that are soft, low-fiber, and low-fat.

## Development Commands

**Run locally** (required because browsers block local JSON fetch):
```bash
python3 -m http.server 8080
```
Then open http://localhost:8080

**Deploy:** Push to GitHub, enable GitHub Pages on main branch.

## Architecture

This is a static site with no build step. All data is loaded client-side from JSON.

### Data Flow
```
menu-data.json → app.js (fetch) → index.html (render)
```

### Key Files

- **menu-data.json** - Single source of truth for all menu content. Contains:
  - `categories[]` - Menu sections (breakfast, soups, dinners, mexican, snacks, desserts)
  - `categories[].items[]` - Individual dishes with `id`, `name`, `description`, `image`, `recipe`
  - `dietaryNotes` - Medical conditions and eating rules
  - `notAllowed` - Foods to avoid with reasons
  - `mealPrepGuide` - Weekly prep and pantry lists
  - `dailySchedule` - 6 meals/day pattern

- **app.js** - Fetches JSON, renders menu sections, handles recipe modal. Key functions:
  - `loadMenuData()` - Entry point, fetches JSON
  - `renderMenuSections()` - Builds category grids
  - `showRecipe(itemId)` - Opens modal with recipe details
  - `findItemById(id)` - Searches across all categories

- **admin.html** - Self-contained editor page (inline JS/CSS). Loads same JSON, allows CRUD operations, exports modified JSON for manual copy-paste back to file.

- **styles.css** - Cabin diner theme using CSS variables (`--cabin-brown`, `--gold`, `--forest-green`, etc.)

## Menu Item Structure

```json
{
  "id": "unique-slug",
  "name": "Display Name",
  "description": "Short description",
  "image": "https://images.unsplash.com/...",
  "isFavorite": true,
  "isSignature": false,
  "recipe": {
    "ingredients": ["item 1", "item 2"],
    "instructions": ["Step 1.", "Step 2."]
  }
}
```

## Adding New Items

Edit `menu-data.json` directly, or use admin.html to edit visually then copy the exported JSON.

Images should be Unsplash URLs with `?w=400` parameter for consistent sizing.
