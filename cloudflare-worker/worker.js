// Cloudflare Worker - Bear Lodge Inn API
// Handles: AI recipe generation + Menu data storage (KV)

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // In production, change to your domain
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route: GET /menu - Fetch menu data
    if (url.pathname === '/menu' && request.method === 'GET') {
      try {
        const menuData = await env.MENU_DATA.get('menu', 'json');

        if (!menuData) {
          return new Response(JSON.stringify({ error: 'No menu data found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify(menuData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Route: POST /menu - Save menu data (password protected)
    if (url.pathname === '/menu' && request.method === 'POST') {
      try {
        const body = await request.json();

        // Check password
        if (body.password !== env.ADMIN_PASSWORD) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Save menu data to KV
        await env.MENU_DATA.put('menu', JSON.stringify(body.menuData));

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Route: POST / (root) - AI recipe generation (existing functionality)
    if (request.method === 'POST' && (url.pathname === '/' || url.pathname === '')) {
      try {
        const body = await request.json();

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(body)
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Route: POST /init - Initialize menu data from JSON (one-time setup)
    if (url.pathname === '/init' && request.method === 'POST') {
      try {
        const body = await request.json();

        if (body.password !== env.ADMIN_PASSWORD) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Check if data already exists
        const existing = await env.MENU_DATA.get('menu');
        if (existing && !body.force) {
          return new Response(JSON.stringify({ error: 'Menu data already exists. Use force: true to overwrite.' }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        await env.MENU_DATA.put('menu', JSON.stringify(body.menuData));

        return new Response(JSON.stringify({ success: true, message: 'Menu initialized' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  }
};
