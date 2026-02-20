/**
 * BANCO GITANO — Client-side Tink integration
 * ─────────────────────────────────────────────
 * All sensitive calls (token exchange, link-session creation, transaction
 * proxying) go through our own Vercel serverless functions under /api/tink/.
 * No client_secret is ever present in this file.
 *
 * Production flow
 * ───────────────
 * 1. Sign-up  → POST /api/tink/create-user  → stores tinkUserId in session
 * 2. "Sync"   → POST /api/tink/link-session → redirects browser to Tink Link
 * 3. Callback → index.html catches ?code=   → POST /api/tink/token
 *                                           → stores accessToken in sessionStorage
 *               then → home.html
 * 4. Home     → GET  /api/tink/transactions (Authorization: Bearer accessToken)
 * 5. Home     → GET  /api/tink/accounts     (Authorization: Bearer accessToken)
 */

// ── Mutable transactions array — filled by loadTinkData() ──────────
let transactions = [];

// ── Helpers ────────────────────────────────────────────────────────

/** Current user access token from sessionStorage. */
function getAccessToken() {
  return sessionStorage.getItem('tink_access_token');
}

/** Clear only Tink session state from browser storage. */
function clearTinkSession() {
  sessionStorage.removeItem('tink_access_token');
  sessionStorage.removeItem('tink_transactions');
}

/** Authorised fetch wrapper — attaches Bearer token to every request. */
async function apiFetch(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${path} failed (${res.status}): ${txt}`);
  }
  return res.json();
}

// ── Tink user creation (called at sign-up) ─────────────────────────

/**
 * Register a new Tink permanent user linked to the current app user.
 * @param {string} externalUserId — unique identifier (e.g. email)
 * @param {string} market         — ISO 3166-1 country code (default 'ES')
 * @returns {Promise<{tinkUserId: string|null, alreadyExists?: boolean}>}
 */
async function createTinkUser(externalUserId, market = 'ES') {
  return apiFetch('/api/tink/create-user', {
    method: 'POST',
    body:   JSON.stringify({ externalUserId, market }),
  });
}

// ── Tink Link session (called to open bank-connection UI) ──────────

/**
 * Ask the server to create a Tink Link session and return the redirect URL.
 * @param {string|null} tinkUserId     — preferred; stored from sign-up.
 * @param {string|null} externalUserId — fallback if tinkUserId is unavailable.
 * @returns {Promise<string>} the Tink Link URL to redirect the user to.
 */
async function buildTinkLinkUrl(tinkUserId, externalUserId) {
  const { url } = await apiFetch('/api/tink/link-session', {
    method: 'POST',
    body:   JSON.stringify({ tinkUserId, externalUserId }),
  });
  return url;
}

// ── Token exchange (called once per bank-connection callback) ──────

/**
 * Exchange the Tink authorization code (from ?code= redirect) for a
 * user access token. Stores the token in sessionStorage.
 * @param {string} code
 * @returns {Promise<void>}
 */
async function exchangeCodeForToken(code) {
  const { accessToken } = await apiFetch('/api/tink/token', {
    method: 'POST',
    body:   JSON.stringify({ code }),
  });
  sessionStorage.setItem('tink_access_token', accessToken);
}

// ── Transactions ───────────────────────────────────────────────────

/**
 * Fetch transactions from our server proxy and store them in the global
 * `transactions` array. Also persists to sessionStorage for fast reload.
 * @returns {Promise<boolean>} true if any transactions were loaded.
 */
async function loadTinkData() {
  const data = await apiFetch('/api/tink/transactions');
  transactions = data.transactions || [];
  sessionStorage.setItem('tink_transactions', JSON.stringify(transactions));
  return transactions.length > 0;
}

/**
 * Restore cached transactions from sessionStorage (avoids a redundant
 * network call on soft reload / in-app navigation).
 * @returns {boolean} true if cached data was found and non-empty.
 */
function restoreCachedTransactions() {
  const cached = sessionStorage.getItem('tink_transactions');
  if (!cached) return false;
  try {
    transactions = JSON.parse(cached);
    return transactions.length > 0;
  } catch {
    return false;
  }
}
