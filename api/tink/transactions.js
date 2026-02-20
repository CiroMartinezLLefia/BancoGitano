/**
 * GET /api/tink/transactions
 * ───────────────────────────
 * Server-side proxy: fetches all transactions from the Tink Data API
 * (GET /data/v2/transactions) using the user access token supplied in the
 * Authorization header, normalises them, and returns the result.
 *
 * Headers: Authorization: Bearer {user_access_token}
 * Return : { transactions: Array<NormalisedTransaction> }
 *
 * NormalisedTransaction shape:
 *   id, date, description, category, type ('income'|'expense'),
 *   amount (positive number), currency, accountId
 */

const { TINK_API, cors } = require('./_helpers');
const PAGE_SIZE = '100';

module.exports = async (req, res) => {
  cors(res);
  res.setHeader('X-BG-Transactions-PageSize', PAGE_SIZE);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  const accessToken = authHeader.slice(7);

  try {
    const allTxns = [];
    let pageToken  = null;

    do {
      const url = new URL(`${TINK_API}/data/v2/transactions`);
      url.searchParams.set('pageSize', PAGE_SIZE);
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const r = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!r.ok) {
        const txt = await r.text();
        return res.status(r.status).json({ error: txt });
      }

      const data = await r.json();

      for (const t of (data.transactions || [])) {
        const unscaled = Number(t.amount?.value?.unscaledValue ?? 0);
        const scale    = Number(t.amount?.value?.scale ?? 2);
        const amount   = Math.abs(unscaled / Math.pow(10, scale));
        const type     = unscaled >= 0 ? 'income' : 'expense';

        allTxns.push({
          id:          t.id,
          date:        (t.dates?.booked || t.dates?.value || '').slice(0, 10),
          description: t.descriptions?.display || t.descriptions?.original || '—',
          category:    t.categories?.pfm?.name || 'Uncategorised',
          type,
          amount,
          currency:    t.amount?.currencyCode ?? 'EUR',
          accountId:   t.accountId ?? '',
        });
      }

      pageToken = data.nextPageToken || null;
    } while (pageToken);

    return res.status(200).json({ transactions: allTxns });
  } catch (err) {
    console.error('[transactions]', err);
    return res.status(500).json({ error: err.message });
  }
};
