# Cloudflare Worker Setup for Bear Lodge AI

This proxy keeps your Anthropic API key secure. Takes ~5 minutes.

## Step 1: Create Cloudflare Account
1. Go to https://dash.cloudflare.com/sign-up
2. Sign up (free, no credit card needed)

## Step 2: Create the Worker
1. In Cloudflare dashboard, click **Workers & Pages** in the left sidebar
2. Click **Create Application**
3. Click **Create Worker**
4. Name it `bear-lodge-ai` (or whatever you want)
5. Click **Deploy**

## Step 3: Add Your Code
1. After deploy, click **Edit Code**
2. Delete all the default code
3. Copy/paste everything from `worker.js` in this folder
4. Click **Deploy** (top right)

## Step 4: Add Your API Key as a Secret
1. Go back to Worker settings (click the worker name)
2. Click **Settings** tab
3. Click **Variables** in the left menu
4. Scroll to **Environment Variables**
5. Click **Add Variable**
6. Name: `ANTHROPIC_API_KEY`
7. Value: Your Anthropic API key (starts with `sk-ant-...`)
8. Click **Encrypt** to make it a secret
9. Click **Save and Deploy**

## Step 5: Get Your Worker URL
Your worker URL will look like:
```
https://bear-lodge-ai.YOUR-SUBDOMAIN.workers.dev
```

Copy this URL - you'll need it for the app.

## Step 6: Update the App
In `app.js`, find this line:
```javascript
const WORKER_URL = 'YOUR_WORKER_URL_HERE';
```

Replace with your actual worker URL:
```javascript
const WORKER_URL = 'https://bear-lodge-ai.your-subdomain.workers.dev';
```

## Step 7: (Optional) Lock Down CORS
For extra security, edit the worker and change:
```javascript
'Access-Control-Allow-Origin': '*'
```
to:
```javascript
'Access-Control-Allow-Origin': 'https://amiley03.github.io'
```

This ensures only your site can use the worker.

## Testing
1. Run the menu locally: `python3 -m http.server 8080`
2. Go to Explore section
3. Enter password
4. Try generating a recipe

## Troubleshooting
- **CORS errors**: Make sure the worker is deployed and URL is correct
- **401 errors**: Check your API key is set correctly in Cloudflare
- **No response**: Check the Cloudflare Workers logs in the dashboard
