/**
 * Shared server-side helpers for Tink API calls.
 * Only imported by other /api/tink/* functions — never called from the browser.
 */

const TINK_API = 'https://api.tink.com';

/** Set CORS headers; call before every response. */
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * Obtain a client-credentials access token from Tink.
 * @param {string} scope  — space-separated Tink scopes required by the call.
 * @returns {Promise<string>}  the raw access_token string.
 */
async function getClientToken(scope) {
  const res = await fetch(`${TINK_API}/api/v1/oauth/token`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     process.env.TINK_CLIENT_ID,
      client_secret: process.env.TINK_CLIENT_SECRET,
      scope,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Tink client-token failed (${res.status}): ${txt}`);
  }

  const json = await res.json();
  return json.access_token;
}

module.exports = { TINK_API, cors, getClientToken };
