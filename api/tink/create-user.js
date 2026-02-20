/**
 * POST /api/tink/create-user
 * ──────────────────────────
 * Creates a permanent Tink user linked to one of our app users.
 * Called server-side during sign-up so the client_secret is never exposed.
 *
 * Body  : { externalUserId: string, market?: string, locale?: string }
 * Return: { tinkUserId: string }
 *
 * If the externalUserId already exists in Tink (409 Conflict) the endpoint
 * still returns 200 with a placeholder tinkUserId — the caller should treat
 * the user as already registered and proceed to link-session directly.
 */

const { TINK_API, cors, getClientToken } = require('./_helpers');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { externalUserId, market = 'ES', locale = 'es_ES' } = req.body || {};
  if (!externalUserId) return res.status(400).json({ error: 'externalUserId is required' });

  try {
    const clientToken = await getClientToken('user:create');

    const r = await fetch(`${TINK_API}/api/v1/user/create`, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${clientToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ external_user_id: externalUserId, market, locale }),
    });

    // 409 = user already exists — treat as success so sign-up is idempotent
    if (r.status === 409) {
      return res.status(200).json({ tinkUserId: null, alreadyExists: true });
    }

    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: txt });
    }

    const data = await r.json();
    return res.status(200).json({ tinkUserId: data.user_id });
  } catch (err) {
    console.error('[create-user]', err);
    return res.status(500).json({ error: err.message });
  }
};
