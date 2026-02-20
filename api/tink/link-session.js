/**
 * POST /api/tink/link-session
 * ────────────────────────────
 * Creates a Tink Link session for a user and returns the URL to open in the
 * browser so the user can connect their bank account.
 *
 * Two accepted flows:
 *  · Preferred — provide tinkUserId (stored at sign-up):
 *      → uses POST /link/v1/session (session_id based Tink Link URL)
 *  · Fallback  — provide externalUserId only (first connection after login):
 *      → uses POST /api/v1/oauth/authorization-grant/delegate
 *        (authorization_code based Tink Link URL)
 *
 * Body  : { tinkUserId?: string, externalUserId?: string, market?: string }
 * Return: { url: string }
 */

const { TINK_API, cors, getClientToken } = require('./_helpers');

const REDIRECT_URI = process.env.TINK_REDIRECT_URI;
const CLIENT_ID    = process.env.TINK_CLIENT_ID;
const SCOPES       = 'accounts:read,transactions:read,credentials:read,credentials:write';

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { tinkUserId, externalUserId, market = 'ES' } = req.body || {};

  if (!tinkUserId && !externalUserId) {
    return res.status(400).json({ error: 'tinkUserId or externalUserId is required' });
  }

  try {
    // ── Flow A: we have the internal Tink user ID ─────────────────
    if (tinkUserId) {
      const clientToken = await getClientToken('link-session:write');

      const r = await fetch(`${TINK_API}/link/v1/session`, {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${clientToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId:      tinkUserId,
          market,
          locale:      'es_ES',
          redirectUri: REDIRECT_URI,
          scopes:      SCOPES,
        }),
      });

      if (!r.ok) {
        const txt = await r.text();
        return res.status(r.status).json({ error: txt });
      }

      const { sessionId } = await r.json();
      const url = `https://link.tink.com/1.0/transactions/connect-accounts` +
                  `?session_id=${sessionId}` +
                  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

      return res.status(200).json({ url });
    }

    // ── Flow B: we only have the external (our) user ID ───────────
    const clientToken = await getClientToken('authorization:grant');

    const r = await fetch(`${TINK_API}/api/v1/oauth/authorization-grant/delegate`, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${clientToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_user_id: externalUserId,
        scope:            SCOPES,
        actor_client_id:  CLIENT_ID,
        id_hint:          externalUserId,
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: txt });
    }

    const { code } = await r.json();
    const url = `https://link.tink.com/1.0/transactions/connect-accounts` +
                `?client_id=${CLIENT_ID}` +
                `&authorization_code=${code}` +
                `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
                `&market=${market}` +
                `&locale=es_ES`;

    return res.status(200).json({ url });
  } catch (err) {
    console.error('[link-session]', err);
    return res.status(500).json({ error: err.message });
  }
};
