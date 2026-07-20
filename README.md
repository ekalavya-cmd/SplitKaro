# SplitKaro 💸

> **🚧 Active Development** — SplitKaro is an actively developed, ongoing project. Features are being added incrementally, and the codebase is evolving rapidly.

---

## 📸 Preview

> _Screenshots and demo recordings coming soon._

---

## 📖 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Development Practices](#development-practices)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview 🌐

**SplitKaro** is a full-stack expense-splitting web application designed to make splitting bills and tracking shared costs between groups of people effortless. Whether it's a trip with friends, shared rent with roommates, or a group dinner — SplitKaro handles the math and keeps everyone's balances clear.

The name "SplitKaro" is a mix of English and Hindi, where _"Karo"_ means _"to do"_, so it literally means **"do the split"**.

> This is an **ongoing project** with more features planned and actively being worked on.

---

## Features ✨

The following features are **fully implemented** in the current version:

### 👥 Group Management
- **Create Groups** with a name, optional description, and members
- **View All Groups** — list all existing groups
- **View Group Details** — see a group's info along with all its members

### 💸 Expense Tracking
- **Add Expenses** to a group with:
  - Description, total amount, date, and who paid
  - Three flexible split types:
    - **Equal** — amount divided evenly among all members (with remainder handled precisely)
    - **Exact** — specify the exact amount each member owes (must sum to the total)
    - **Percentage** — assign a percentage to each member (must sum to 100%)
- **View Expenses** per group, with payer details and per-member split breakdown
- **Delete Expenses** with transactional safety
- **Filter Expenses** on the Dashboard by description (debounced search), split type, and payer

### 📊 Balance Calculation
- **Real-time Balance Computation** — calculates each member's net balance (what they paid vs. what they owe, accounting for settlements)
- Visual balance cards: green (is owed), red (owes), grey (settled)
- Balance integrity validation — ensures all balances sum to zero

### 🤝 Settlement Suggestions
- **Smart Settlement Suggestions** — uses a greedy algorithm to compute the minimum number of transactions needed to settle all debts within a group
- Displayed on both the Dashboard and the Settle Up page

### 💳 Settlement Recording
- **Record Payments** between members to mark debts as cleared
- **Validation** — prevents settling more than what is owed, prevents self-settlements, and validates both payer and payee are group members
- **Settlement History** — view all past settlements for a group
- **Delete Settlements** to undo a recorded payment

### 🔗 Frontend Pages
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Overview of group balances, settlement suggestions, and filterable expense table |
| Expenses | `/expenses` | Full expense list with delete functionality |
| Add Expense | `/add-expense/:id` | Form to add a new expense with dynamic split UI |
| Settle Up | `/settle-up` | Record settlements and view settlement history |
| 404 Error | `*` | Friendly not-found page |

---

## Tech Stack 🛠️

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | — | Runtime environment |
| **Express.js** | v5.x | Web framework (REST API) |
| **Sequelize** | v6.x | ORM for database interaction |
| **MySQL2** | v3.x | MySQL database driver |
| **Redis (node-redis)** | v6.x | Refresh token storage (rotating tokens) |
| **jsonwebtoken** | v9.x | JWT access token signing and verification |
| **bcrypt** | v5.x | Password hashing (cost factor 12) |
| **cookie-parser** | v1.x | httpOnly cookie parsing for refresh tokens |
| **Winston** | v3.x | Centralized structured logging |
| **winston-daily-rotate-file** | v5.x | Rolling log file transport |
| **dotenv** | v17.x | Environment variable management |
| **cors** | v2.x | Cross-origin request handling |
| **nodemon** | v3.x | Development auto-reload |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | v18.x | UI library |
| **React Router DOM** | v7.x | Client-side routing |
| **Vite** | v8.x | Build tool and dev server |
| **Tailwind CSS** | v4.x | Utility-first CSS styling |
| **Axios** | v1.x | HTTP client for API calls |
| **ESLint** | v9.x | Code linting |
| **Prettier** | — | Code formatting (with Tailwind plugin) |

### Database
| Technology | Purpose |
|------------|---------|
| **MySQL** | Relational database |
| **Redis** | Refresh token store |
| **Sequelize Migrations** | Schema versioning and management |

---

## Architecture 🏗️

SplitKaro follows a classic **Client–Server** architecture with a clear separation between the frontend and backend.

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│  React (Vite) + Tailwind CSS + React Router + Axios     │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │Dashboard │  │Expenses  │  │AddExpense│  │Settle  │  │
│  │  (/)     │  │(/expens.)│  │(/add-e.) │  │Up      │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│         │           │              │             │       │
│         └────────────────────────────────────────┘       │
│                         │                                │
│              splitKaroService.js (service layer)         │
│                         │                                │
│              splitKaroAPI.js (Axios instance)            │
└──────────────────────────┬───────────────────────────────┘
                           │  HTTP/REST (port 5173 → 3000)
┌──────────────────────────▼──────────────────────────────┐
│                        SERVER                           │
│              Node.js + Express.js (port 3000)           │
│                                                         │
│  Routes: /api/auth/*   /api/groups/*   /api/expenses/*  │
│       ↓                                                 │
│  Middleware: auth.middleware.js (JWT verification)       │
│       ↓                                                 │
│  Controllers: authController  groupController           │
│               expenseController                         │
│       ↓                                                 │
│  Services: auth.service  token.service                  │
│            groupService  expenseService                 │
│       ↓                                                 │
│  Sequelize ORM (Models)                                 │
│  User | GroupMember | Groups | Expenses                 │
│  ExpenseSplits | Settlements                            │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                     MySQL Database                      │
│         Database: splitKaro_db (localhost:3306)         │
└─────────────────────────────────────────────────────────┘
```

### Backend Design Patterns
- **Layered Architecture**: Routes → Controllers → Services → Models (ORM)
- **Service Layer**: All business logic lives in `services/`, keeping controllers thin
- **Transactional Safety**: All multi-step write operations (create group + members, delete expense/settlement) are wrapped in Sequelize transactions with rollback support
- **Centralized Error Handling**: Controllers catch service-level errors with structured `{ status, message }` objects and forward appropriate HTTP responses

### Frontend Design Patterns
- **Service Abstraction**: `splitKaroService.js` provides a clean API facade over the raw Axios instance
- **Axios Interceptors**: `splitKaroAPI.js` centralizes error normalization at the HTTP layer
- **Custom Hooks**: `useDebounce` for debounced input filtering
- **React Router v7**: SPA routing with a shared `Layout` wrapper

---

## Project Structure 📁

```
splitKaro/
├── backend/
│   ├── config/
│   │   ├── config.js              # Sequelize DB config (reads from .env)
│   │   ├── logger.config.js       # Winston logger (console + daily rotating files)
│   │   └── redis.config.js        # node-redis v6 client (refresh token storage)
│   ├── controllers/
│   │   ├── auth.controller.js     # register, login, refresh, logout, logoutAllDevices
│   │   ├── groupController.js     # HTTP handlers for group-related routes
│   │   └── expenseController.js   # HTTP handlers for expense-related routes
│   ├── logs/                      # Winston daily log files (gitignored)
│   ├── middleware/
│   │   └── auth.middleware.js     # Verifies JWT Bearer token, sets req.userId
│   ├── migrations/                # Sequelize migration files
│   ├── models/
│   │   ├── index.js               # Auto-loads all models, sets up associations
│   │   ├── User.js
│   │   ├── GroupMember.js
│   │   ├── Groups.js
│   │   ├── Expenses.js
│   │   ├── ExpenseSplits.js
│   │   └── Settlements.js
│   ├── routes/
│   │   ├── auth.routes.js         # 5 routes under /api/auth
│   │   ├── groupRoutes.js         # All /api/groups/* route definitions
│   │   └── expenseRoutes.js       # All /api/expenses/* route definitions
│   ├── seeders/                   # (Reserved for seed data)
│   ├── services/
│   │   ├── auth.service.js        # registerUser, loginUser (bcrypt + token issuance)
│   │   ├── token.service.js       # JWT access tokens + Redis rotating refresh tokens
│   │   ├── groupService.js        # Core business logic (balances, splits, settlements)
│   │   └── expenseService.js      # Expense deletion logic
│   ├── utils/
│   │   └── equalSplitAmount.js    # Precise integer-based equal-split algorithm
│   ├── .env                       # Environment variables (not committed)
│   ├── .env.example               # Template with all keys, values blanked
│   ├── .gitignore
│   ├── package.json
│   └── server.js                  # Express app entry point
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── splitKaroAPI.js    # Axios instance with interceptors
    │   ├── assets/
    │   ├── hooks/
    │   │   └── useDebounce.js     # Custom debounce hook
    │   ├── pages/
    │   │   ├── Layout.jsx         # Shared navbar + <Outlet />
    │   │   ├── Dashboard.jsx      # Main overview page
    │   │   ├── Expenses.jsx       # Expense list + delete
    │   │   ├── AddExpense.jsx     # Add expense form with dynamic split UI
    │   │   ├── SettleUp.jsx       # Settlement recording + history
    │   │   └── Error404.jsx       # 404 not found page
    │   ├── services/
    │   │   └── splitKaroService.js # API call wrappers
    │   ├── App.jsx                # Route definitions
    │   ├── main.jsx               # React entry point
    │   ├── index.css
    │   └── App.css
    ├── index.html
    ├── vite.config.js
    ├── .env                       # VITE_API_URL (not committed)
    ├── .prettierrc
    ├── eslint.config.js
    └── package.json
```

---

## Database Schema 🗄️

```
┌──────────────┐        ┌──────────────┐
│    groups    │        │   members    │
├──────────────┤        ├──────────────┤
│ id (PK)      │◄───────│ group_id (FK)│
│ name         │        │ id (PK)      │
│ description  │        │ name         │
│ created_at   │        │ email (UNIQ) │
│ updated_at   │        │ phone        │
└──────┬───────┘        │ created_at   │
       │                │ updated_at   │
       │                └──────┬───────┘
       │                       │
       │     ┌─────────────────┘
       │     │
       ▼     ▼
┌──────────────────┐       ┌───────────────────┐
│    expenses      │       │  expense_splits   │
├──────────────────┤       ├───────────────────┤
│ id (PK)          │◄──────│ expense_id (FK)   │
│ group_id (FK)    │       │ id (PK)           │
│ paid_by (FK)     │       │ member_id (FK)    │
│ amount           │       │ amount_owed       │
│ description      │       │ created_at        │
│ split_type       │       │ updated_at        │
│ date             │       └───────────────────┘
│ created_at       │
│ updated_at       │
└──────────────────┘

┌───────────────────┐
│   settlements     │
├───────────────────┤
│ id (PK)           │
│ group_id (FK)     │
│ paid_by (FK)      │ → member (payer)
│ paid_to (FK)      │ → member (payee)
│ amount            │
│ date              │
│ created_at        │
│ updated_at        │
└───────────────────┘
```

**Key Relationships:**
- A `Group` has many `Members`, `Expenses`, and `Settlements`
- An `Expense` belongs to a `Group` and a `Member` (payer), and has many `ExpenseSplits`
- Each `ExpenseSplit` belongs to an `Expense` and a `Member`
- A `Settlement` belongs to a `Group` and two `Members` (`payer` and `payee`)

---

## API Reference 🔌

Base URL: `http://localhost:3000/api`

### Groups

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/groups` | List all groups |
| `GET` | `/groups/:id` | Get a group with its members |
| `POST` | `/groups` | Create a group with members |
| `GET` | `/groups/:id/expenses` | Get all expenses for a group |
| `POST` | `/groups/:id/expenses` | Add an expense to a group |
| `GET` | `/groups/:id/balances` | Calculate net balances for all members |
| `GET` | `/groups/:id/settlements/suggest` | Get suggested settlement transactions |
| `POST` | `/groups/:id/settlements` | Record a settlement payment |
| `GET` | `/groups/:id/settlements` | List all settlements for a group |
| `DELETE` | `/groups/settlements/:id` | Delete a settlement record |

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| `DELETE` | `/expenses/:id` | Delete an expense |

### Authentication

| Method | Endpoint | Auth required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/auth/register` | — | Create account; returns access token + sets refresh cookie |
| `POST` | `/auth/login` | — | Login; returns access token + sets refresh cookie |
| `POST` | `/auth/refresh` | Cookie | Exchange refresh cookie for a new access token (token rotation) |
| `POST` | `/auth/logout` | Bearer token | Revoke current session refresh token and clear cookie |
| `POST` | `/auth/logout-all` | Bearer token | Revoke all sessions for this user across all devices |

### Example: Create Group

```json
POST /api/groups
{
  "name": "Goa Trip",
  "description": "Summer 2026 trip",
  "members": [
    { "name": "Alice", "email": "alice@example.com", "phone": "9876543210" },
    { "name": "Bob",   "email": "bob@example.com",   "phone": "9123456789" }
  ]
}
```

### Example: Add Expense (Equal Split)

```json
POST /api/groups/1/expenses
{
  "paid_by": 1,
  "amount": 600,
  "description": "Hotel booking",
  "split_type": "equal",
  "date": "2026-07-10"
}
```

### Example: Add Expense (Percentage Split)

```json
POST /api/groups/1/expenses
{
  "paid_by": 1,
  "amount": 1000,
  "description": "Cab fare",
  "split_type": "percentage",
  "date": "2026-07-10",
  "splits": {
    "1": 60,
    "2": 40
  }
}
```

### Example: Record Settlement

```json
POST /api/groups/1/settlements
{
  "paid_by": 2,
  "paid_to": 1,
  "amount": 300,
  "date": "2026-07-11"
}
```

---

## Getting Started 🚀

### Prerequisites

- **Node.js** (v18 or later recommended)
- **MySQL** (v8.x) running locally
- **npm** (comes with Node.js)

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ekalavya-zwt/splitKaro.git
   cd splitKaro/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Copy `backend/.env.example` to `backend/.env` and fill in your values:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=splitKaro_db
   PORT=3000
   REDIS_URL=redis://127.0.0.1:6379
   JWT_ACCESS_SECRET=your_64_char_hex_secret
   LOG_LEVEL=debug
   ```

4. **Create the MySQL database:**
   ```sql
   CREATE DATABASE splitKaro_db;
   ```

5. **Run database migrations:**
   ```bash
   npx sequelize-cli db:migrate
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

   The backend will be running at `http://localhost:3000`.

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file inside `frontend/`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be running at `http://localhost:5173`.

---

## Environment Variables 🔐

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | _(your password)_ |
| `DB_NAME` | MySQL database name | `splitKaro_db` |
| `PORT` | Port the Express server listens on | `3000` |
| `REDIS_URL` | Redis connection URL | `redis://127.0.0.1:6379` |
| `JWT_ACCESS_SECRET` | Secret key for signing JWT access tokens | _(generate a 64-char random hex string)_ |
| `LOG_LEVEL` | Winston log level (`debug`/`info`/`warn`/`error`) | `debug` |

Copy `backend/.env.example` to `backend/.env` and fill in the values.

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for the backend API | `http://localhost:3000/api` |

> ⚠️ **Never commit your `.env` files.** Both are listed in `.gitignore`.

---

## Development Practices 🧑‍💻

- **Monorepo Layout**: `backend/` and `frontend/` are separate npm workspaces within the same repository, each with their own `package.json`.
- **CommonJS (Backend)**: The backend uses `require`/`module.exports` (CommonJS modules).
- **ES Modules (Frontend)**: The frontend uses `import`/`export` (ESM), as configured in `package.json` with `"type": "module"`.
- **Database Migrations**: Schema changes are managed via Sequelize CLI migrations for reproducibility and version control.
- **Transactional Writes**: All write operations that touch multiple tables use Sequelize transactions to ensure atomicity and automatic rollback on failure.
- **Precision in Arithmetic**: Monetary amounts are converted to integers (cents/paise) before splitting to avoid floating-point rounding errors. The `equalSplitAmount` utility distributes remainders one unit at a time to ensure the total is always exact.
- **Input Validation**: The backend validates all inputs at the service layer and returns structured error objects (`{ status, message }`) that controllers forward as HTTP responses.
- **Code Formatting**: Prettier is configured with the Tailwind CSS plugin to sort Tailwind class names automatically.
- **Linting**: ESLint v9 with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` is used to enforce React best practices.
- **Debouncing**: The `useDebounce` custom hook prevents excessive re-renders when users type in the expense description filter.

---

## Roadmap 🗺️

> Features planned for upcoming development.

| Feature | Description |
|---------|-------------|
| **UPI QR-Based Settlements** | Payers can attach their UPI QR code to a group so payees can scan and pay directly — no need to ask for payment details separately |
| **Real-Time Notifications** | Live push notifications (e.g. via WebSockets or SSE) so members are instantly notified when a new expense is added or a settlement is recorded |
| **Email Invites** | Send email invitations to people to join a group, removing the need for manual member addition |
| **Recent Activity Feed** | A chronological log of all group and expense activity (expense added, settlement recorded, member joined, etc.) visible per group |
| **Expense Categories & Tags** | Categorise expenses (🍔 Food, ✈️ Travel, 🏨 Stay, 🎉 Entertainment) and visualise spending by category with charts |
| **Receipt Attachments** | Attach a photo of a receipt to any expense for transparency and record-keeping |
| **Recurring Expenses** | Set up auto-repeating expenses (e.g. monthly rent, Netflix subscription) that are created and split automatically on a schedule |
| **Multi-Currency Support** | Record expenses in different currencies with automatic conversion — essential for international trips |
| **Export Reports** | Download a group's full expense and settlement history as a **PDF** or **CSV** file |
| **Group Archiving** | Archive fully-settled groups to keep the UI clean without permanently deleting data |
| **Reminders & Nudges** | Automatically remind group members with pending balances to settle up via email or in-app notification |
| **Spending Analytics Dashboard** | Visual charts (pie, bar, timeline) showing each member's total spend, share of group expenses, and balance trend over time |

---

## License 📄

This project is licensed under the **ISC License**.
