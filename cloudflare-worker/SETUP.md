# Cloudflare Worker Setup for Bear Lodge

This worker handles AI recipe generation AND menu data storage using Cloudflare KV.

## Prerequisites

Install Wrangler CLI:
```bash
npm install -g wrangler
```

Login to Cloudflare:
```bash
npx wrangler login
```

## Step 1: Create KV Namespace

```bash
cd /Users/aemsolutions/Desktop/DAD/bear-lodge-menu/cloudflare-worker
npx wrangler kv:namespace create "MENU_DATA"
```

This will output something like:
```
{ binding = "MENU_DATA", id = "abc123xyz..." }
```

Copy the `id` value and paste it into `wrangler.toml` replacing `YOUR_KV_NAMESPACE_ID_HERE`.

## Step 2: Set Secrets

```bash
# Your Anthropic API key (for AI recipes)
npx wrangler secret put ANTHROPIC_API_KEY
# Enter: sk-ant-...

# Admin password (for saving menu - use "bearbear" to match the app)
npx wrangler secret put ADMIN_PASSWORD
# Enter: bearbear
```

## Step 3: Deploy the Worker

```bash
npx wrangler deploy
```

Your worker URL will be: `https://bear-lodge-api.YOUR-SUBDOMAIN.workers.dev`

## Step 4: Initialize Menu Data

After deploying, run this once to upload your current menu-data.json to KV:

```bash
# From the bear-lodge-menu directory
curl -X POST https://bear-lodge-api.YOUR-SUBDOMAIN.workers.dev/init \
  -H "Content-Type: application/json" \
  -d "{\"password\": \"bearbear\", \"menuData\": $(cat menu-data.json)}"
```

Or use the admin page - there's an "Upload to Cloud" button.

## Step 5: Verify

Test the menu endpoint:
```bash
curl https://bear-lodge-api.YOUR-SUBDOMAIN.workers.dev/menu
```

You should see your menu JSON.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/menu` | Fetch menu data |
| POST | `/menu` | Save menu data (requires password) |
| POST | `/init` | Initialize menu data (one-time) |
| POST | `/` | AI recipe generation |

## Updating the Worker

After making changes to worker.js:
```bash
npx wrangler deploy
```

## Troubleshooting

**"No menu data found"**: Run the init command to upload menu-data.json

**401 Unauthorized**: Check ADMIN_PASSWORD secret matches "bearbear"

**KV errors**: Make sure the namespace ID in wrangler.toml is correct

**View logs**:
```bash
npx wrangler tail
```
