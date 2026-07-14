# ARCHITECTURE.md — SplitKaro

---

## 1. Project Overview

SplitKaro is a bill-splitting web application that lets users create groups, add members, record shared expenses (split equally, by exact amounts, or by percentage), track per-member balances, generate optimised settlement suggestions, and record or delete actual payments between members. The project is a classic two-tier client/server application: a React + Vite single-page app communicates with an Express REST API backed by a MySQL database managed through Sequelize ORM.

---

## 2. High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                           │
│                                                                │
│  main.jsx → App.jsx (React Router v7)                          │
│                                                                │
│  Pages: Dashboard | Expenses | AddExpense | SettleUp | Error404│
│       ↕  local useState / useEffect  (no global state store)   │
│  services/splitKaroService.js  (thin wrapper per API call)     │
│       ↕  axios (10 s timeout, response error interceptor)      │
│  api/splitKaroAPI.js  (axios instance, baseURL from .env)      │
└───────────────────────┬────────────────────────────────────────┘
          HTTP (JSON)   │   VITE_API_URL = http://localhost:3000/api
┌───────────────────────▼────────────────────────────────────────┐
│                   Express Server  (Node.js)                    │
│                                                                │
│  server.js — cors, express.json(), route mounting             │
│                                                                │
│  Routes                                                        │
│   /api/groups/*      → groupRoutes.js → groupController.js    │
│   /api/expenses/:id  → expenseRoutes.js → expenseController.js│
│                                                                │
│  Controllers — validate HTTP input, call service, respond      │
│                                                                │
│  Services — all business logic                                 │
│   groupService.js  (groups, expenses, balances, settlements)   │
│   expenseService.js  (delete expense)                          │
│                                                                │
│  Utils                                                         │
│   equalSplitAmount.js  (integer-safe equal-split with pennies) │
└───────────────────────┬────────────────────────────────────────┘
      Sequelize ORM      │
┌───────────────────────▼────────────────────────────────────────┐
│               MySQL  (splitKaro_db)                            │
│                                                                │
│  Tables: groups · members · expenses · expense_splits          │
│          settlements                                            │
└────────────────────────────────────────────────────────────────┘
```

**Typical request flow (e.g., "Add Expense"):**

1. User fills the `AddExpense` page and submits.
2. `splitKaroService.createExpense()` calls `POST /api/groups/:id/expenses` via the axios instance.
3. Express routes the request to `groupController.createExpense`.
4. Controller calls `groupService.createExpenseForGroup()`.
5. Service validates all inputs (payer membership, split type, amounts), computes split rows, then creates `Expenses` + `ExpenseSplits` records inside a single Sequelize transaction.
6. Controller responds `201` with the new expense and splits.
7. The page navigates back to the Dashboard, which re-fetches expenses and balances.

---

## 3. Folder Structure

```
splitKaro/
├── backend/                    # Express REST API
│   ├── config/
│   │   └── config.js           # Sequelize DB config; reads from .env
│   ├── controllers/
│   │   ├── groupController.js  # HTTP handlers for all group-scoped routes
│   │   └── expenseController.js# HTTP handler for DELETE /expenses/:id
│   ├── migrations/             # Sequelize migration files (5 tables)
│   ├── models/
│   │   ├── index.js            # Auto-loads all models, runs associations
│   │   ├── Groups.js
│   │   ├── Members.js
│   │   ├── Expenses.js
│   │   ├── ExpenseSplits.js
│   │   └── Settlements.js
│   ├── routes/
│   │   ├── groupRoutes.js      # 9 routes under /api/groups
│   │   └── expenseRoutes.js    # 1 route: DELETE /api/expenses/:id
│   ├── seeders/                # Sequelize seed files (groups, members, expenses, splits, settlements)
│   ├── services/
│   │   ├── groupService.js     # Core business logic (balance calc, settlement algorithm, transactions)
│   │   └── expenseService.js   # Thin service: delete expense in a transaction
│   ├── utils/
│   │   └── equalSplitAmount.js # Integer-safe equal-split helper (distributes penny remainders)
│   ├── .env                    # DB credentials and PORT (not committed in production)
│   ├── package.json
│   └── server.js               # Entry point: Express app bootstrap + DB connect
│
├── frontend/                   # React 18 SPA (Vite + Tailwind CSS v4)
│   ├── public/                 # Static assets served as-is
│   ├── src/
│   │   ├── api/
│   │   │   └── splitKaroAPI.js # Axios instance with base URL + error interceptor
│   │   ├── hooks/
│   │   │   └── useDebounce.js  # Generic debounce hook (used for expense description filter)
│   │   ├── pages/
│   │   │   ├── Layout.jsx      # Shell: top nav bar + <Outlet />
│   │   │   ├── Dashboard.jsx   # Group selector, balances, settlement suggestions, expense table
│   │   │   ├── Expenses.jsx    # Group expense list with per-expense delete
│   │   │   ├── AddExpense.jsx  # Form to add expense with split-type picker
│   │   │   ├── SettleUp.jsx    # Record / view / delete settlements
│   │   │   └── Error404.jsx    # Catch-all 404 page
│   │   ├── services/
│   │   │   └── splitKaroService.js # One function per API endpoint (10 functions)
│   │   ├── App.jsx             # Route tree (React Router v7)
│   │   ├── main.jsx            # React root mount + BrowserRouter
│   │   └── index.css           # Minimal global CSS (Tailwind handled by plugin)
│   ├── .env                    # VITE_API_URL (http://localhost:3000/api)
│   ├── package.json
│   └── vite.config.js          # Vite with @vitejs/plugin-react + @tailwindcss/vite
│
└── README.md                   # Project readme
```

---

## 4. Key Architectural Decisions

### Layered backend (Routes → Controllers → Services → Models)
Each layer has a single responsibility: routes bind URLs to handlers, controllers translate HTTP to service calls and back, services contain all business logic, models define schema and associations. This is consistent throughout the codebase.

### Sequelize ORM with MySQL
All database interaction goes through Sequelize models. The `models/index.js` auto-discovers every `.js` file in the models directory and calls its `associate` method, making it easy to add new models without touching the loader.

### Database transactions for write operations
`createGroupWithMembers`, `createExpenseForGroup`, `deleteExpense`, and `deleteSettlement` all use explicit Sequelize transactions with commit/rollback, preventing partial writes.

### Integer-safe monetary arithmetic
`equalSplitAmount.js` operates in integer cents (`totalAmount * 100`) and distributes penny remainders one-by-one to avoid floating-point drift. The same pattern is used in the percentage-split path in `groupService.js`.

### Server-side balance calculation
Member balances and settlement suggestions are computed on the server in `calculateGroupBalances` and `suggestSettlementForGroup`. The suggestion algorithm is a greedy two-pointer approach (largest creditor vs. largest debtor) that minimises the number of transactions.

### Axios instance with centralised error interceptor
`splitKaroAPI.js` creates a single axios instance pointed at `VITE_API_URL`. A response interceptor normalises all error shapes to `{ status, message }` before they reach service or component code.

### Frontend state: local useState / useEffect per page
All data fetching and state lives inside individual page components via `useState`/`useEffect`. There is no global state management library (no Redux, Zustand, Context, React Query, etc.).

### Split types: equal, exact, percentage
The `splitType` field is a MySQL `ENUM('equal','exact','percentage')` enforced at both the DB and service layers. The service validates that exact-split amounts sum to the total, and that percentage-split values sum to 100.

### CORS locked to http://localhost:5173
The Express server explicitly allows only the Vite dev-server origin. This is hard-coded in `server.js`.

### Environment configuration via .env files
Backend uses `dotenv`; frontend uses Vite's `import.meta.env`. Both `.env` files are present in the repo (not gitignored at this time).

---

## 5. Known Gaps / TODOs

| Area | Issue |
|---|---|
| **.env files in version control** | Both `backend/.env` and `frontend/.env` appear to be committed, exposing DB credentials. They should be added to `.gitignore` and replaced with `.env.example` files. |
| **CORS origin hard-coded** | `origin: "http://localhost:5173"` in `server.js` will break any non-local deployment without a code change. Should be driven from an environment variable. |
| **No input validation middleware** | Validation logic is spread across controller (`createGroup`) and service (`createExpenseForGroup`). There is no schema-validation library (e.g., Zod, Joi, express-validator) applied consistently. |
| **No request logging / APM** | No HTTP request logger (e.g., Morgan) or error-tracking service is wired up. |
| **No frontend error boundaries** | React error boundaries are not implemented. An uncaught render error will crash the entire SPA. |
| **Frontend state not shared across pages** | Each page independently fetches the full groups list and group details. Switching between Dashboard and Expenses triggers duplicate network requests because there is no shared cache or global store. |
| **Config only has development environment** | `config/config.js` defines only a `development` block. There is no `production` or `test` configuration. |

> For missing product features (auth, tests, rate limiting, pagination, Docker/CI), see `FEATURES.md §3`.
> For model-level defects (broken `ExpenseSplits` association), see `DATABASE_SCHEMA.md §3`.
> For API-level bugs (DELETE null-crash, `data.error` key mismatch, `<a href>` nav links), see `API_REFERENCE.md §Flagged Inconsistencies` and `FEATURES.md §2 Known Bugs`.
