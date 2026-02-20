/**
 * BANCO GITANO — Example Transactions
 * ─────────────────────────────────────
 * This dataset mimics the structure returned by the Tink Transactions API.
 * Replace with real Tink API calls when ready.
 *
 * Tink Transaction fields (simplified):
 *   id          — unique transaction ID
 *   date        — ISO date string (YYYY-MM-DD)
 *   description — merchant / payee name
 *   category    — Tink category label
 *   type        — 'income' | 'expense'
 *   amount      — absolute value in EUR
 *   currency    — ISO 4217 currency code
 *   accountId   — linked bank account ID
 */

const transactions = [
  // ── Income ────────────────────────────────────────────────────────
  { id: 'txn_001', date: '2026-02-01', description: 'Salary — Gitano Corp',        category: 'Salary',        type: 'income',  amount: 2800.00, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_002', date: '2026-02-03', description: 'Freelance Invoice #42',        category: 'Freelance',     type: 'income',  amount:  450.00, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_003', date: '2026-02-10', description: 'Dividend — ETF Portfolio',     category: 'Investment',    type: 'income',  amount:   82.50, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_004', date: '2026-02-14', description: 'Refund — Amazon Order',        category: 'Refund',        type: 'income',  amount:   34.99, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_005', date: '2026-02-20', description: 'Bank Interest',                category: 'Interest',      type: 'income',  amount:    5.12, currency: 'EUR', accountId: 'acc_savings' },

  // ── Food & Drink ──────────────────────────────────────────────────
  { id: 'txn_006', date: '2026-02-01', description: 'Mercadona',                    category: 'Groceries',     type: 'expense', amount:   87.40, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_007', date: '2026-02-04', description: 'Starbucks',                    category: 'Café',          type: 'expense', amount:    6.80, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_008', date: '2026-02-07', description: 'El Fogón Restaurant',          category: 'Dining Out',    type: 'expense', amount:   42.00, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_009', date: '2026-02-11', description: 'Carrefour',                    category: 'Groceries',     type: 'expense', amount:   63.10, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_010', date: '2026-02-15', description: 'McDonald\'s',                  category: 'Fast Food',     type: 'expense', amount:   11.60, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_011', date: '2026-02-18', description: 'Glovo Delivery',               category: 'Dining Out',    type: 'expense', amount:   23.90, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_012', date: '2026-02-21', description: 'Lidl',                         category: 'Groceries',     type: 'expense', amount:   51.75, currency: 'EUR', accountId: 'acc_main' },

  // ── Housing ───────────────────────────────────────────────────────
  { id: 'txn_013', date: '2026-02-01', description: 'Rent — Calle Mayor 12',        category: 'Rent',          type: 'expense', amount:  950.00, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_014', date: '2026-02-05', description: 'Endesa Electricity Bill',      category: 'Utilities',     type: 'expense', amount:   74.30, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_015', date: '2026-02-05', description: 'Canal Isabel II Water Bill',   category: 'Utilities',     type: 'expense', amount:   28.90, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_016', date: '2026-02-06', description: 'Internet — Movistar',          category: 'Internet',      type: 'expense', amount:   39.99, currency: 'EUR', accountId: 'acc_main' },

  // ── Transport ──────────────────────────────────────────────────────
  { id: 'txn_017', date: '2026-02-02', description: 'Metro Madrid — Monthly Pass',  category: 'Transport',     type: 'expense', amount:   54.60, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_018', date: '2026-02-08', description: 'Uber',                         category: 'Taxi',          type: 'expense', amount:   12.40, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_019', date: '2026-02-13', description: 'Renfe Train Ticket',           category: 'Transport',     type: 'expense', amount:   38.00, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_020', date: '2026-02-19', description: 'BP Fuel Station',              category: 'Fuel',          type: 'expense', amount:   55.00, currency: 'EUR', accountId: 'acc_main' },

  // ── Health ────────────────────────────────────────────────────────
  { id: 'txn_021', date: '2026-02-03', description: 'Farmacia Vallehermoso',        category: 'Pharmacy',      type: 'expense', amount:   18.50, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_022', date: '2026-02-12', description: 'Sanitas Health Insurance',     category: 'Insurance',     type: 'expense', amount:   65.00, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_023', date: '2026-02-17', description: 'Gym — Holmes Place',           category: 'Sport & Gym',   type: 'expense', amount:   49.00, currency: 'EUR', accountId: 'acc_main' },

  // ── Entertainment & Shopping ──────────────────────────────────────
  { id: 'txn_024', date: '2026-02-06', description: 'Netflix',                      category: 'Streaming',     type: 'expense', amount:   17.99, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_025', date: '2026-02-06', description: 'Spotify',                      category: 'Streaming',     type: 'expense', amount:    9.99, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_026', date: '2026-02-09', description: 'Zara',                         category: 'Clothing',      type: 'expense', amount:   79.95, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_027', date: '2026-02-14', description: 'Cines Callao Cinema',          category: 'Entertainment', type: 'expense', amount:   16.00, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_028', date: '2026-02-16', description: 'El Corte Inglés — Electronics',category: 'Electronics',   type: 'expense', amount:  199.00, currency: 'EUR', accountId: 'acc_main' },
  { id: 'txn_029', date: '2026-02-22', description: 'Amazon — Books',               category: 'Education',     type: 'expense', amount:   29.90, currency: 'EUR', accountId: 'acc_main' },

  // ── Savings & Transfers ───────────────────────────────────────────
  { id: 'txn_030', date: '2026-02-01', description: 'Transfer to Savings Account',  category: 'Savings',       type: 'expense', amount:  300.00, currency: 'EUR', accountId: 'acc_main' },
];
