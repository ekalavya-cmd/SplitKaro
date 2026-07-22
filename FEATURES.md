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
| 🐛 | Shipped but broken — code exists, but it crashes or produces wrong output |

---

## 1. Implemented Features ✅

### Group Management
| Feature | Current behaviour |
|---|---|
| ✅ Create group | POST `/api/groups` — creator-only flow; creates group, adds creator as first member via `group_members`, and returns an `inviteToken`. Protected by auth middleware. |
| ✅ List my groups | GET `/api/groups` — returns only groups the authenticated user is a member of (no members included). Protected by auth middleware. |
| ✅ View group detail | GET `/api/groups/:id` — queries group and members via `User` and `GroupMember` association (R2 refactor). |
| ✅ Group selector (UI) | The `<select>` dropdown UI itself is fine; it will resume populating correctly once the underlying GET `/api/groups` read path is unbroken by R2. |
| ✅ Join group via invite link | GET `/api/groups/invite/:token` previews the group (no member list), and POST `/api/groups/invite/:token/join` adds the authenticated user to the group via the `group_members` join table. |

### Member Management
| Feature | Current behaviour |
|---|---|
| 🚧 Create members at group creation | **No longer exists under new schema.** Group creation is now creator-only (planned sub-step R1). Joining a group happens via invite link (planned sub-step R5 — not yet built). |
| ✅ View members in group | Member lists are fetched as part of `GET /api/groups/:id` via `User` and `GroupMember` association (R2 refactor). |

### Expense Management
| Feature | Current behaviour |
|---|---|
| ✅ Add expense — equal split | Divides total amount evenly; penny remainder distributed one cent at a time to the first N members |
| ✅ Add expense — exact split | User enters per-member amounts; server validates they sum to total (±0.01) |
| ✅ Add expense — percentage split | User enters per-member %; server validates they sum to 100 (±0.01) and computes currency amounts with penny-safe rounding |
| ✅ Expense form with live split preview | `AddExpense.jsx` shows a read-only per-member preview panel for equal splits, and editable inputs for exact/percentage; running total shown |
| ✅ List expenses for a group | GET `/api/groups/:id/expenses` — expenses with payer info and full split detail per member (R6b discovery: fixed to use User schema and verified working) |
| ✅ View expenses on Dashboard | Expense table on Dashboard page with date, description, payer, amount, split type badge, split breakdown |
| ✅ View expenses on Expenses page | Dedicated Expenses page with same columns plus a Delete button per row |
| ✅ Delete expense | DELETE `/api/groups/:id/expenses/:expenseId` — cascades to all associated `expense_splits` rows via DB CASCADE. Gated by group membership authorization, and validates that the expense belongs to the URL's group (returns 404 otherwise). |
| ✅ Confirm-before-delete | Expenses page uses `window.confirm()` dialog before calling delete |
| ✅ Split type colour badges | Equal = blue, exact = green, percentage = yellow; consistent across Dashboard and Expenses pages |

### Expense Filtering (client-side only)
| Feature | Current behaviour |
|---|---|
| ✅ Filter by description | Shared component/hook (`ExpenseFilters`); debounced (300 ms) case-insensitive text search on Dashboard and Expenses pages |
| ✅ Filter by split type | Shared dropdown filter (all / equal / exact / percentage) on Dashboard and Expenses pages |
| ✅ Filter by payer | Shared dropdown filter populated from current group's members on Dashboard and Expenses pages |
| ✅ Filter by Date (Preset / Custom) | Shared preset selectors (Today, This Week, This Month, Last 30 Days, This Year) or custom calendar selectors (From/To dates) using local timezone-safe dates on Dashboard and Expenses pages |
| ✅ Filter by Amount | Shared Min and Max amount boundaries to filter the expense table on Dashboard and Expenses pages |

### Balance Tracking
| Feature | Current behaviour |
|---|---|
| ✅ Per-member balance calculation | Server computes `total_paid − total_owed − settlements_received + settlements_paid` in real time for each group (R3: fixed to use User schema). |
| ✅ Balance integrity check | Server throws `500` if all balances don't sum to zero — detects rounding bugs (preserved in R3). |
| ✅ Balance cards on Dashboard | Cards colour-coded: green (owed money), red (owes money), grey (settled); shows absolute amount and direction label |

### Settlement Workflow
| Feature | Current behaviour |
|---|---|
| ✅ Settlement suggestions | GET `/api/groups/:id/settlements/suggest` — greedy two-pointer algorithm that minimises transaction count (R3: fixed to use User schema). |
| ✅ Suggestions shown on Dashboard | Dashboard shows suggested payments with a "Settle" button that navigates to `/settle-up` |
| ✅ Suggestions shown on SettleUp page | SettleUp left panel shows the current suggestions list alongside the form |
| ✅ Record settlement | SettleUp form: select payer, payee, enter amount and date; server validates payer owes money and payee is owed money (R6b discovery: fixed to use User schema and verified working) |
| ✅ Partial settlement | The backend accepts any amount up to but not exceeding `min(|payer balance|, payee balance)` (R6b discovery: fixed to use User schema and verified working) |
| ✅ Settlement history table | SettleUp page shows all recorded settlements for the selected group (date, payer, payee, amount) (R6b discovery: fixed to use User schema and verified working) |
| ✅ Suggestions refresh after recording | SettleUp re-fetches suggestions and settlements list immediately after a successful `createSettlement` call |
| ✅ Form feedback via `alert()` | SettleUp shows `alert("Settlement recorded successfully!")` on success and `alert("Failed to record settlement...")` on error |
| ✅ Pre-fill settlement form from suggestion | Dashboard "Settle" button passes payer, payee, and amount via `location.state` to pre-fill the form on SettleUp page |

### Settlement History Filtering (client-side only)
| Feature | Current behaviour |
|---|---|
| ✅ Filter by payer | Dropdown (All Payers / per-member) on SettleUp history table |
| ✅ Filter by payee | Dropdown (All Payees / per-member) on SettleUp history table |
| ✅ Filter by Date (Preset / Custom) | Shared preset selectors (Today, This Week, This Month, Last 30 Days, This Year) or custom From/To date inputs — reuses `dateFilters.js` utility |

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
| Delete settlement (UI) | 🚧 | Backend `DELETE /api/groups/settlements/:id` exists (gated by group membership authorization) and is wired in `splitKaroService.deleteSettlement()` | The SettleUp page has no delete button in the settlement history table; the service function is never called from any page |

### Feedback & UX
| Feature | Status | What exists | What is missing |
|---|---|---|---|
| Loading states | 🚧 | No loading indicators anywhere | Spinners or skeleton screens while fetching data |
| Error display in UI | 🚧 | AddExpense.jsx and SettleUp.jsx show `alert()` on failure; all other pages only log to `console.error` | Dashboard and Expenses pages show no user-visible feedback when data fetching fails |


---

## 3. Known Bugs 🐛

| Bug | Status | Description |
|---|---|---|
| groupService.js references dropped Members model | 🐛 | The `members` table was retired during the auth schema migration. `groupService.js` read paths still query the old `Members` model. **Fix in progress:** sub-steps R1, R2, and R3 are done. Next up: R4 (activity). R5 (join via invite link) and R6 (route authorization) are separate new-functionality items. See `ARCHITECTURE.md §5 Known Gaps` for more detail. |
| createExpenseForGroup schema reference bug | ✅ | **Resolved**: Discovered out-of-sequence during R3 testing. Expense creation was still referencing the deleted `Members` model when validating users and creating splits. Refactored to use the new `User` + `GroupMember` schema. |
| API error key mismatch | ✅ | **Resolved**: Updated axios interceptor to read `data?.message`. Backend validation/error messages are now correctly shown in the UI. |
| equal split preview wrong | 🐛 | AddExpense.jsx previews `amount / members.length` (floating-point) but the server uses integer-cent math with penny-remainder distribution — the preview can show different values than what gets stored |
| Nav links cause full-page reload | ✅ | **Resolved**: Swapped `<a href="...">` nav tags for React Router's `<Link>` components in Layout.jsx. Navigation now works client-side without full-page reloads. |
| DELETE endpoints return 500 for missing IDs | ✅ | **Resolved**: Added null guards in `deleteExpense` and `deleteSettlement` to correctly return a `404` error instead of crashing. |
| schema reference bugs in remaining functions | ✅ | **Resolved**: Discovered out-of-sequence during R6b testing. `createSettlement`, `getExpensesForGroup`, and `getSettlementsForGroup` were still referencing the deleted `Members` model. Refactored to use the new `User` + `GroupMember` schema. A full grep of `groupService.js` confirms zero remaining `Members` references. |

---

## 4. Planned / Missing Features ⏳

### Authentication & Identity
| Feature | Status | Notes |
|---|---|---|
| User registration / login | 🚧 | Backend complete: `POST /api/auth/register`, `POST /api/auth/login` with bcrypt + JWT access tokens + Redis-backed rotating refresh tokens. Frontend UI not yet built. |
| Token refresh / session management | 🚧 | Backend complete: `POST /api/auth/refresh`, `POST /api/auth/logout`, `POST /api/auth/logout-all`. Frontend interceptor not yet wired. |
| Per-user view of splits across groups | ⏳ | Group membership now uses platform `users` via `group_members` join table; cross-group identity exists at DB level but no UI yet |
| Protected routes (frontend) | ⏳ | Auth middleware (`authenticate`) exists on backend; frontend pages are still publicly accessible |
| Google OAuth | ⏳ | Schema ready (`google_id` column on users); implementation deferred to step 5f |

### Group Management
| Feature | Status | Notes |
|---|---|---|
| Invite members via email | ⏳ | Link-based joining is implemented (see §1), but email-based invitations are not built |
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
| Total balance across all groups (dashboard aggregate) | ⏳ | Additional aggregate view summing a user's position across all their groups. Unlike `GET /:id/balances` which correctly isolates a single group's finances, this represents the overall friend/dashboard balance. Likely implemented as a new endpoint (e.g. `GET /api/users/me/balances`) querying `group_members` to sum each group's `calculateGroupBalances` result for the user, rather than reimplementing balance math globally. |

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

| Layer | ✅ Done | 🐛 Broken | 🚧 Partial | ⏳ Not started |
|---|---|---|---|---|
| Backend (API endpoints) | 5 expense/delete + 5 auth + 6 group = 16 | 0 group endpoints | 2 | 10+ |
| Frontend (pages / UI flows) | 5 pages shipped | Group-dependent UI (balance cards, member dropdowns) | 4 gaps within shipped pages | Auth UI (login/register pages, token refresh interceptor) |
| Infrastructure | Winston logging | — | 0 | 6 |

_§4 ⏳ total: 6 (auth) + 3 (groups) + 8 (expenses) + 3 (settlements) + 6 (data) + 6 (infra) = 32 planned items_

> **Note on group endpoint counts:** All 4 group-management API endpoints are now fully functional again following the R1–R3 refactor. They have been moved back to ✅ Done. R4–R6 are new functionality or authorization layers, not bug fixes.
