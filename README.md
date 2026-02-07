# Bear Lodge Inn - Menu Application

A personalized digital menu system designed for Larry, who has portal hypertension, gastroparesis, and esophageal varices. Every recipe is carefully crafted to be soft, low-fiber, low-fat, and low-sodium while still tasting like real comfort food.

## Features

### Menu Display
- **Beautiful cabin diner theme** with warm, cozy aesthetics
- **Category navigation** - Breakfast, Soups, Dinners, Mexican, Air Fryer, Sandwiches, Pizza, Chinese, Snacks, Desserts
- **Recipe cards** with images, descriptions, and dietary badges
- **Recipe modal** with full ingredients and instructions
- **Search bar** to filter menu items in real-time
- **Daily eating schedule** showing 6 small meals per day

### Dietary Filters
- **Flare-Up Mode** - Shows only the gentlest items (liquid, soft, easy to swallow) for variceal flare-ups
- **Healing Mode** - Avoids spicy and acidic foods during esophageal band recovery (2 weeks post-procedure)
- Visual badges: "Gentle" (green), "Healing" (purple), "Larry's Fave" (gold), "Signature" (red)

### User Voting
- Thumbs up/down voting on recipes
- Votes persist in localStorage
- "Liked" badge appears on favorited items

### Shopping List
- Organized by category (Proteins, Dairy, Carbs, Sauces, Produce, Pantry)
- **Up to 3 buy links per ingredient** (Walmart, Amazon, Target, etc.)
- Auto-detects store from URL and shows color-coded buttons
- Falls back to Walmart search if no links configured

### Chef Bear (AI Recipe Generator)
- Password-protected AI interface
- Generates new recipes that follow Larry's dietary restrictions
- Uses only approved ingredients from the Foundation list
- Daily "Recipe of the Day" feature
- Add generated recipes directly to the menu

### Admin Panel
- Password-protected editor at `/admin.html`
- Add, edit, delete menu items
- **Auto-saves to cloud** - no manual export needed
- Foundation tab to manage approved ingredients and buy links
- Ingredient validation with option to override
- Dietary tagging (Favorite, Signature, Flare-Up Safe, Healing Safe)

### Cloud Storage
- Menu data stored in Cloudflare KV
- Changes sync automatically
- Works across all devices
- Fallback to local JSON if cloud unavailable

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no framework)
- **Storage**: Cloudflare Workers KV
- **AI**: Claude API via Cloudflare Worker proxy
- **Hosting**: GitHub Pages
- **Images**: Unsplash

## Project Structure

```
bear-lodge-menu/
├── index.html          # Main menu page
├── admin.html          # Menu editor (password: bearbear)
├── discover.html       # Safe foods discovery page
├── app.js              # Main application logic
├── styles.css          # All styling
├── menu-data.json      # Local menu data (backup/fallback)
├── safe-products.json  # Pre-approved product links
├── cloudflare-worker/  # API proxy and KV storage
│   ├── worker.js       # Cloudflare Worker code
│   ├── wrangler.toml   # Worker configuration
│   └── SETUP.md        # Deployment instructions
└── README.md           # This file
```

## Local Development

1. **Start a local server** (required for JSON fetch):
   ```bash
   python3 -m http.server 8080
   ```

2. **Open in browser**:
   - Menu: http://localhost:8080
   - Admin: http://localhost:8080/admin.html

## Cloudflare Worker Setup

The worker handles AI recipe generation and menu storage. See `cloudflare-worker/SETUP.md` for full instructions.

Quick setup:
```bash
cd cloudflare-worker

# Login to Cloudflare
npx wrangler login

# Create KV namespace
npx wrangler kv namespace create "MENU_DATA"
# Copy the ID to wrangler.toml

# Set secrets
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put ADMIN_PASSWORD  # use: bearbear

# Deploy
npx wrangler deploy
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/menu` | Fetch menu data from KV |
| POST | `/menu` | Save menu data (requires password) |
| POST | `/init` | Initialize menu data (one-time) |
| POST | `/` | AI recipe generation |

## Dietary Guidelines

### The Bear Lodge Way
- Soft, low-fiber, LOW-FAT foods only
- Small portions (1-1.5 cups max)
- 6 small meals per day
- Chew thoroughly, eat slowly
- No drinking with meals
- Low-sodium everything

### Foods to Avoid
- **High Fiber**: Raw vegetables, whole grains, nuts, seeds, popcorn
- **Fatty Foods**: Fried foods, bacon, sausage, full-fat dairy
- **Tough Textures**: Steak, raw carrots, crusty bread
- **Risky Items**: Alcohol, caffeine, spicy foods, carbonation

### Flare-Up Safe Foods
Liquid and ultra-soft items only:
- All soups
- Cream of Wheat, yogurt, smoothies
- Mashed potatoes with gravy
- Puddings, ice cream
- Scrambled eggs

### Healing Mode Foods
Avoid during band recovery:
- Tomato-based sauces (acidic)
- Vinegar-based dressings
- Citrus (lemon, lime)
- Spicy seasonings

## Passwords

- **Admin Panel**: `bearbear`
- **Chef Bear AI**: `bearbear`

## Contributing

This is a personal project for Larry's dietary needs. The menu items and restrictions are specifically tailored to his medical conditions.

## Credits

- Built with love by the family
- AI recipes powered by Claude (Anthropic)
- Images from Unsplash
- Hosted on GitHub Pages + Cloudflare

---

*Bear Lodge Inn - Made Fresh for Larry*
