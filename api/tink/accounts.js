/**
 * GET /api/tink/accounts
 * ───────────────────────
 * Server-side proxy: fetches all accounts from the Tink Data API
 * (GET /data/v2/accounts) and returns them normalised.
 *
 * Headers: Authorization: Bearer {user_access_token}
 * Return : { accounts: Array<NormalisedAccount> }
 *
 * NormalisedAccount shape:
 *   id, name, type, balance, currency, bankName
 */

const { TINK_API, cors } = require('./_helpers');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  const accessToken = authHeader.slice(7);

  try {
    const r = await fetch(`${TINK_API}/data/v2/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: txt });
    }

    const data = await r.json();

    const accounts = (data.accounts || []).map(a => {
      const unscaled = Number(a.balances?.booked?.amount?.value?.unscaledValue ?? 0);
      const scale    = Number(a.balances?.booked?.amount?.value?.scale ?? 2);
      return {
        id:       a.id,
        name:     a.name ?? 'Account',
        type:     a.type ?? 'UNKNOWN',
        balance:  unscaled / Math.pow(10, scale),
        currency: a.balances?.booked?.amount?.currencyCode ?? 'EUR',
        bankName: a.financialInstitutionId ?? '',
      };
    });

    return res.status(200).json({ accounts });
  } catch (err) {
    console.error('[accounts]', err);
    return res.status(500).json({ error: err.message });
  }
};
