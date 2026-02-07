// Cloudflare Worker - Anthropic API Proxy for Bear Lodge Inn
// This keeps your API key secure on the server side

export default {
  async fetch(request, env) {
    // CORS headers - update with your actual domain
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // In production, change to your domain
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      // Get the request body from the frontend
      const body = await request.json();

      // Call Anthropic API with your secret key
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,  // Secret stored in Cloudflare
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(body)
      });

      // Get the response
      const data = await response.json();

      // Return to frontend
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
  }
};
