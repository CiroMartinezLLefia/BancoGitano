/**
 * POST /api/tink/link-session
 * ────────────────────────────
 * Creates a Tink Link session for a user and returns the URL to open in the
 * browser so the user can connect their bank account.
 *
 * Uses the recommended session-based flow (POST /link/v1/session) which
 * accepts either the internal Tink userId OR the externalUserId we assigned
 * at sign-up.  The old authorization_code flow is no longer used.
 *
 * Body  : { tinkUserId?: string, externalUserId?: string, market?: string }
 * Return: { url: string }
 */

const { TINK_API, cors, getClientToken } = require('./_helpers');

const REDIRECT_URI = process.env.TINK_REDIRECT_URI;

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { tinkUserId, externalUserId, market = 'ES' } = req.body || {};

  if (!tinkUserId && !externalUserId) {
    return res.status(400).json({ error: 'tinkUserId or externalUserId is required' });
  }

  try {
    const clientToken = await getClientToken('link-session:write');

    const reference = (externalUserId || tinkUserId || '').slice(0, 50);
    const sessionBody = {
      user: {
        firstName: 'Banco',
        lastName: 'Gitano',
      },
      ...(reference ? { externalReference: reference } : {}),
    };

    const r = await fetch(`${TINK_API}/link/v1/session`, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${clientToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionBody),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error('[link-session] Tink response:', r.status, txt);
      return res.status(r.status).json({ error: txt });
    }

    const { sessionId } = await r.json();
    const url = `https://link.tink.com/1.0/transactions/connect-accounts` +
          `?session_id=${sessionId}` +
                `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
                `&market=${market}` +
                `&locale=es_ES`;

    return res.status(200).json({ url });
  } catch (err) {
    console.error('[link-session]', err);
    return res.status(500).json({ error: err.message });
  }
};
