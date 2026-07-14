# FEATURES.md — SplitKaro

> **Competitive benchmark used:** Splitwise (core feature set) — the closest
> analogue for a group bill-splitting app. Any feature present in a baseline
> Splitwise-style app that is not in SplitKaro is listed under **Planned / Missing**.
> This file is a live snapshot; update each row as features ship.

---

## Status Legend

| Symbol | Meaning |
|---|---|
| ✅ | Fully implemented — backend API + working frontend UI |
| 🚧 | Partially implemented — one side exists or the feature is incomplete |
| ⏳ | Not started — no code exists in either layer |

---

## 1. Implemented Features ✅

### Group Management
| Feature | Current behaviour |
|---|---|
| ✅ Create group | POST `/api/groups` — creates group + all initial members in a single transaction |
| ✅ List all groups | GET `/api/groups` — flat list of all groups (id, name, description) |
| ✅ View group detail | GET `/api/groups/:id` — returns group with full member list, ordered by id |
| ✅ Group selector (UI) | Every page renders a `<select>` dropdown populated from the groups list; defaults to the first group on load |

### Member Management
| Feature | Current behaviour |
|---|---|
| ✅ Create members at group creation | Members (name, email, phone) are submitted alongside the group and persisted atomically |
| ✅ View members in group | Members shown on Dashboard balance cards and in all dropdown menus |

### Expense Management
| Feature | Current behaviour |
|---|---|
| ✅ Add expense — equal split | Divides total amount evenly; penny remainder distributed one cent at a time to the first N members |
| ✅ Add expense — exact split | User enters per-member amounts; server validates they sum to total (±0.01) |
| ✅ Add expense — percentage split | User enters per-member %; server validates they sum to 100 (±0.01) and computes currency amounts with penny-safe rounding |
| ✅ Expense form with live split preview | `AddExpense.jsx` shows a read-only per-member preview panel for equal splits, and editable inputs for exact/percentage; running total shown |
| ✅ List expenses for a group | GET `/api/groups/:id/expenses` — expenses with payer info and full split detail per member |
| ✅ View expenses on Dashboard | Expense table on Dashboard page with date, description, payer, amount, split type badge, split breakdown |
| ✅ View expenses on Expenses page | Dedicated Expenses page with same columns plus a Delete button per row |
| ✅ Delete expense | DELETE `/api/expenses/:id` — cascades to all associated `expense_splits` rows via DB CASCADE |
| ✅ Confirm-before-delete | Expenses page uses `window.confirm()` dialog before calling delete |
| ✅ Split type colour badges | Equal = blue, exact = green, percentage = yellow; consistent across Dashboard and Expenses pages |

### Expense Filtering (client-side only)
| Feature | Current behaviour |
|---|---|
| ✅ Filter by description | Debounced (300 ms) text search on Dashboard; filters `expense.description` case-insensitively |
| ✅ Filter by split type | Dropdown filter (all / equal / exact / percentage) on Dashboard |
| ✅ Filter by payer | Dropdown filter populated from current group's members on Dashboard |

### Balance Tracking
| Feature | Current behaviour |
|---|---|
| ✅ Per-member balance calculation | Server computes `total_paid − total_owed − settlements_received + settlements_paid` in real time for each group |
| ✅ Balance integrity check | Server throws `500` if all balances don't sum to zero — detects rounding bugs |
| ✅ Balance cards on Dashboard | Cards colour-coded: green (owed money), red (owes money), grey (settled); shows absolute amount and direction label |

### Settlement Workflow
| Feature | Current behaviour |
|---|---|
| ✅ Settlement suggestions | GET `/api/groups/:id/settlements/suggest` — greedy two-pointer algorithm that minimises transaction count |
| ✅ Suggestions shown on Dashboard | Dashboard shows suggested payments with a "Settle" button that navigates to `/settle-up` |
| ✅ Suggestions shown on SettleUp page | SettleUp left panel shows the current suggestions list alongside the form |
| ✅ Record settlement | SettleUp form: select payer, payee, enter amount and date; server validates payer owes money and payee is owed money |
| ✅ Partial settlement | The backend accepts any amount up to but not exceeding `min(|payer balance|, payee balance)` |
| ✅ Settlement history table | SettleUp page shows all recorded settlements for the selected group (date, payer, payee, amount) |
| ✅ Suggestions refresh after recording | SettleUp re-fetches suggestions and settlements list immediately after a successful `createSettlement` call |
| ✅ Form feedback via `alert()` | SettleUp shows `alert("Settlement recorded successfully!")` on success and `alert("Failed to record settlement...")` on error |

### Navigation & Layout
| Feature | Current behaviour |
|---|---|
| ✅ Top navigation bar | Layout.jsx renders nav with links to Dashboard, Expenses, and Settle Up |
| ✅ Client-side routing | React Router v7 handles Dashboard (`/`), Expenses (`/expenses`), AddExpense (`/add-expense/:id`), SettleUp (`/settle-up`) |
| ✅ 404 page | `Error404.jsx` rendered for all unmatched routes |

---

## 2. Partially Implemented 🚧

> **Key:** 🚧 = one side exists or the feature is visibly incomplete &nbsp; 🐛 = shipped but broken

### Group Management
| Feature | Status | What exists | What is missing |
|---|---|---|---|
| Edit group | 🚧 | Nothing | No backend endpoint; no frontend UI |
| Delete group | 🚧 | DB CASCADE rule would handle cascading deletes | No backend endpoint; no frontend UI |
| Add members to existing group | 🚧 | Nothing | No backend endpoint (members can only be added at group creation time); no frontend UI |
| Remove members from group | 🚧 | Nothing | No backend endpoint; no frontend UI |

### Expense Management
| Feature | Status | What exists | What is missing |
|---|---|---|---|
| Edit expense | 🚧 | Nothing | No backend endpoint; no frontend UI |
| Delete settlement (UI) | 🚧 | Backend `DELETE /api/groups/settlements/:id` exists and is wired in `splitKaroService.deleteSettlement()` | The SettleUp page has no delete button in the settlement history table; the service function is never called from any page |

### Feedback & UX
| Feature | Status | What exists | What is missing |
|---|---|---|---|
| Loading states | 🚧 | No loading indicators anywhere | Spinners or skeleton screens while fetching data |
| Error display in UI | 🚧 | AddExpense.jsx and SettleUp.jsx show `alert()` on failure; all other pages only log to `console.error` | Dashboard and Expenses pages show no user-visible feedback when data fetching fails |

### Settlement Workflow
| Feature | Status | What exists | What is missing |
|---|---|---|---|
| Pre-fill settlement form from suggestion | 🚧 | Dashboard "Settle" button navigates to `/settle-up` | No data is passed; the form always opens blank — the user must manually re-select payer, payee, and enter amount |

---

## 3. Known Bugs 🐛

| Bug | Status | Description |
|---|---|---|
| API error key mismatch | ✅ | **Resolved**: Updated axios interceptor to read `data?.message`. Backend validation/error messages are now correctly shown in the UI. |
| Equal split preview wrong | 🐛 | AddExpense.jsx previews `amount / members.length` (floating-point) but the server uses integer-cent math with penny-remainder distribution — the preview can show different values than what gets stored |
| Nav links cause full-page reload | 🐛 | `Layout.jsx` uses `<a href="...">` instead of React Router `<Link>` — every nav click triggers a full reload and discards in-memory state |
| DELETE endpoints return 500 for missing IDs | ✅ | **Resolved**: Added null guards in `deleteExpense` and `deleteSettlement` to correctly return a `404` error instead of crashing. |

---

## 4. Planned / Missing Features ⏳

### Authentication & Identity
| Feature | Status | Notes |
|---|---|---|
| User registration / login | ⏳ | No `users` table, no session/token system, no auth middleware |
| Per-user view of splits across groups | ⏳ | Members are group-scoped constructs; there is no cross-group identity |
| Protected routes (frontend) | ⏳ | All pages are publicly accessible |

### Group Management
| Feature | Status | Notes |
|---|---|---|
| Invite members via link or email | ⏳ | No invite mechanism of any kind |
| Member profile / avatar | ⏳ | Only name, email, phone stored |
| Member phone validation | ⏳ | Phone is stored as free-text VARCHAR; no format validation |

### Expense Management
| Feature | Status | Notes |
|---|---|---|
| Edit existing expense | ⏳ | No backend endpoint; would require recalculating splits |
| Expense categories / tags | ⏳ | No category field in schema |
| Multi-currency support | ⏳ | All amounts stored as bare DECIMAL; INR (₹) is hard-coded in both API error strings and UI |
| Expense date picker (past/future) | ⏳ | Date input exists but no calendar picker; browser native `<input type="date">` only |
| Receipt / attachment upload | ⏳ | No file storage or attachment table |
| Recurring expenses | ⏳ | No scheduling or recurrence concept |
| Expense notes / comments | ⏳ | No notes field |
| Bulk expense import | ⏳ | No CSV or spreadsheet import |

### Settlement Workflow
| Feature | Status | Notes |
|---|---|---|
| UPI QR-based settlements | ⏳ | Payees would attach a UPI QR code to the group so payers can scan and pay directly without exchanging payment details separately; no QR storage or payment-link generation exists |
| Real-time activity notifications | ⏳ | Live push (WebSocket or SSE) so all group members are instantly notified when a new expense is added or a settlement is recorded; no real-time layer exists |
| Settlement reminders / nudges | ⏳ | Automated reminders to members with outstanding balances to settle up (email or in-app); no notification or scheduling system exists |

### Data & Visibility
| Feature | Status | Notes |
|---|---|---|
| Group activity log / feed | ⏳ | No audit table; deleting an expense leaves no trace |
| Expense search (server-side) | ⏳ | All filtering is client-side; unbounded data set returned |
| Pagination | ⏳ | All list endpoints return full unbound result sets |
| Export to CSV / PDF | ⏳ | No export functionality |
| Group archiving | ⏳ | Archive fully-settled groups to keep the UI clean without permanently deleting data; no archived/status column exists in the `groups` schema |
| Spending analytics dashboard | ⏳ | Visual charts (pie, bar, timeline) showing each member's total spend, share of group expenses, and balance trend over time; no analytics endpoints or charting library exists |

### Infrastructure & Quality
| Feature | Status | Notes |
|---|---|---|
| Automated tests | ⏳ | Zero test files exist in either workspace |
| Rate limiting | ⏳ | No middleware on any endpoint |
| API versioning | ⏳ | All routes are un-versioned (`/api/...`) |
| Production config | ⏳ | Only `development` environment defined in `config/config.js` |
| Docker / deployment setup | ⏳ | No Dockerfile, docker-compose.yml, or CI config |
| React Error Boundaries | ⏳ | No error boundaries; any render crash takes down the full SPA |

---

## Quick Counts

| Layer | ✅ Done | 🚧 Partial | ⏳ Not started |
|---|---|---|---|
| Backend (API endpoints) | 9 | 2 | 10+ |
| Frontend (pages / UI flows) | 5 pages shipped | 5 gaps within shipped pages | 0 pages for missing features |
| Infrastructure | 0 | 0 | 7 |

_§4 ⏳ total: 6 (auth) + 3 (groups) + 8 (expenses) + 3 (settlements) + 6 (data) + 6 (infra) = 32 planned items_
