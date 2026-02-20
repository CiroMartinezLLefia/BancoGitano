/**
 * POST /api/tink/token
 * ─────────────────────
 * Exchanges a Tink authorization code for a user-scoped access token.
 * Runs server-side so TINK_CLIENT_SECRET is never sent to the browser.
 *
 * Body  : { code: string }
 * Return: { accessToken: string, expiresIn: number, scope: string }
 */

const { TINK_API, cors, getClientToken } = require('./_helpers');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'code is required' });

  try {
    const r = await fetch(`${TINK_API}/api/v1/oauth/token`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        client_id:     process.env.TINK_CLIENT_ID,
        client_secret: process.env.TINK_CLIENT_SECRET,
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: txt });
    }

    const { access_token, expires_in, scope } = await r.json();
    return res.status(200).json({
      accessToken: access_token,
      expiresIn:   expires_in,
      scope,
    });
  } catch (err) {
    console.error('[token]', err);
    return res.status(500).json({ error: err.message });
  }
};
