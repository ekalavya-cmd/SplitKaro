# ARCHITECTURE.md — SplitKaro

---

## 1. Project Overview

SplitKaro is a bill-splitting web application that lets users create groups, add users, record shared expenses (split equally, by exact amounts, or by percentage), track per-user balances, generate optimised settlement suggestions, and record or delete actual payments between users. The project is a classic two-tier client/server application: a React + Vite single-page app communicates with an Express REST API backed by a MySQL database managed through Sequelize ORM.

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
│  server.js — cors, cookie-parser, express.json(), route mounting        │
│                                                                │
│  Routes                                                        │
│   /api/auth/*        → auth.routes.js → auth.controller.js    │
│   /api/groups/*      → groupRoutes.js → groupController.js    │
│   /api/expenses/:id  → expenseRoutes.js → expenseController.js│
│                                                                │
│  Middleware                                                    │
│   auth.middleware.js — verifies JWT, attaches req.userId       │
│                                                                │
│  Controllers — validate HTTP input, call service, respond      │
│                                                                │
│  Services — all business logic                                 │
│   auth.service.js   (register, login — bcrypt + token issue)  │
│   token.service.js  (JWT sign/verify, Redis refresh tokens)    │
│   groupService.js  (groups, expenses, balances, settlements)   │
│   expenseService.js  (delete expense)                          │
│                                                                │
│  Config                                                        │
│   logger.config.js  (Winston — console + daily rotating files) │
│   redis.config.js   (node-redis v6 client — refresh tokens)   │
│                                                                │
│  Utils                                                         │
│   equalSplitAmount.js  (integer-safe equal-split with pennies) │
└───────────────────────┬────────────────────────────────────────┘
      Sequelize ORM      │                  Redis
┌───────────────────────▼────────────────────────────────────────┐
│               MySQL  (splitKaro_db)                            │
│                                                                │
│  Tables: groups · users · group_members · expenses             │
│          expense_splits · settlements                          │
└────────────────────────────────────────────────────────────────┘
```

**Typical request flow (e.g., "Add Expense"):**

1. User fills the `AddExpense` page and submits.
2. `splitKaroService.createExpense()` calls `POST /api/groups/:id/expenses` via the axios instance.
3. Express routes the request to `groupController.createExpense`.
4. Controller calls `groupService.createExpenseForGroup()`.
5. Service validates all inputs (payer is part of the group, split type, amounts), computes split rows, then creates `Expenses` + `ExpenseSplits` records inside a single Sequelize transaction.
6. Controller responds `201` with the new expense and splits.
7. The page navigates back to the Dashboard, which re-fetches expenses and balances.

---

## 3. Folder Structure

```
splitKaro/
├── backend/                    # Express REST API
│   ├── config/
│   │   ├── config.js           # Sequelize DB config; reads from .env
│   │   ├── logger.config.js    # Winston logger (console + daily rotating files)
│   │   └── redis.config.js     # node-redis v6 client (refresh token storage)
│   ├── controllers/
│   │   ├── auth.controller.js  # register, login, refresh, logout, logoutAllDevices
│   │   ├── groupController.js  # HTTP handlers for all group-scoped routes
│   │   └── expenseController.js# HTTP handler for DELETE /expenses/:id
│   ├── logs/                   # Winston daily log files (gitignored)
│   ├── middleware/
│   │   └── auth.middleware.js  # Verifies JWT Bearer token, sets req.userId
│   ├── migrations/             # Sequelize migration files
│   ├── models/
│   │   ├── index.js            # Auto-loads all models, runs associations
│   │   ├── User.js
│   │   ├── GroupMember.js
│   │   ├── Groups.js
│   │   ├── Expenses.js
│   │   ├── ExpenseSplits.js
│   │   └── Settlements.js
│   ├── routes/
│   │   ├── auth.routes.js      # 5 routes under /api/auth
│   │   ├── groupRoutes.js      # 9 routes under /api/groups
│   │   └── expenseRoutes.js    # 1 route: DELETE /api/expenses/:id
│   ├── seeders/                # Sequelize seed files
│   ├── services/
│   │   ├── auth.service.js     # registerUser, loginUser (bcrypt + token issuance)
│   │   ├── token.service.js    # JWT access tokens + Redis rotating refresh tokens
│   │   ├── groupService.js     # Core business logic (balance calc, settlement algorithm, transactions)
│   │   └── expenseService.js   # Thin service: delete expense in a transaction
│   ├── utils/
│   │   └── equalSplitAmount.js # Integer-safe equal-split helper (distributes penny remainders)
│   ├── .env                    # DB credentials, PORT, Redis URL, JWT secrets (not committed)
│   ├── .env.example            # Template env file with all keys, values blanked
│   ├── package.json
│   └── server.js               # Entry point: Express app bootstrap + DB connect
│
├── frontend/                   # React 18 SPA (Vite + Tailwind CSS v4)
│   ├── public/                 # Static assets served as-is
│   ├── src/
│   │   ├── api/
│   │   │   └── splitKaroAPI.js # Axios instance with base URL + error interceptor
│   │   ├── components/
│   │   │   ├── ExpenseFilters.jsx    # Reusable expense filtering UI component
│   │   │   └── SettlementFilters.jsx # Reusable settlement filtering UI component
│   │   ├── hooks/
│   │   │   ├── useDebounce.js          # Generic debounce hook
│   │   │   ├── useExpenseFilters.js    # Expense filtering state + logic
│   │   │   └── useSettlementFilters.js # Settlement filtering state + logic
│   │   ├── utils/
│   │   │   └── dateFilters.js  # Shared date helpers: formatDateToLocalYMD, calculatePresetDates
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
User balances and settlement suggestions are computed on the server in `calculateGroupBalances` and `suggestSettlementForGroup`. The suggestion algorithm is a greedy two-pointer approach (largest creditor vs. largest debtor) that minimises the number of transactions.

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
| **CORS origin hard-coded** | `origin: "http://localhost:5173"` in `server.js` will break any non-local deployment without a code change. Should be driven from an environment variable. |
| **No input validation middleware** | Validation logic is spread across auth controller (HTTP boundary) and service layer (business rules). There is no schema-validation library (e.g., Zod, Joi, express-validator) applied consistently across group/expense controllers. |
| **groupService.js still references Members** | The `groupService.js` and `groupController.js` still contain references to the retired `Members` model (e.g., `createGroupWithMembers`). These need to be refactored to use `User` + `GroupMember` before group endpoints can function correctly with the new schema. |
| **authenticate middleware not wired onto group/expense routes** | The `authenticate` middleware exists but is not yet applied to `/api/groups/*` or `/api/expenses/*` — this will happen after `groupService.js` is refactored. |
| **No frontend error boundaries** | React error boundaries are not implemented. An uncaught render error will crash the entire SPA. |
| **Frontend state not shared across pages** | Each page independently fetches the full groups list and group details. No shared cache or global store exists. |
| **Config only has development environment** | `config/config.js` defines only a `development` block. There is no `production` or `test` configuration. |
| **Redis console calls** | `backend/config/redis.config.js` still uses `console.log`/`console.warn`/`console.error` for Redis events. Should be converted to the Winston logger. |

> For missing product features (auth frontend, tests, rate limiting, pagination, Docker/CI), see `FEATURES.md`.
> For model-level gaps, see `DATABASE_SCHEMA.md §6 Not Yet Modeled`.
> For API-level bugs, see `API_REFERENCE.md §Flagged Inconsistencies`.
