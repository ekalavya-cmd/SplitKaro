# SplitKaro 💸

> **🚧 Active Development** — This project is actively being built by [Ekalavya](https://github.com/ekalavya-zwt). Features are being added incrementally, and the codebase is evolving rapidly.

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

## About

**SplitKaro** is a full-stack expense-splitting web application designed to make splitting bills and tracking shared costs between groups of people effortless. Whether it's a trip with friends, shared rent with roommates, or a group dinner — SplitKaro handles the math and keeps everyone's balances clear.

The name "SplitKaro" is a mix of English and Hindi, where _"Karo"_ means _"to do"_, so it literally means **"do the split"**.

> This is an **ongoing project** with more features planned and actively being worked on.

---

## Features

The following features are **fully implemented** in the current version:

### 👥 Group Management
- **Create Groups** with a name, optional description, and one or more members (each with name, email, and phone)
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

## Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | — | Runtime environment |
| **Express.js** | v5.x | Web framework (REST API) |
| **Sequelize** | v6.x | ORM for database interaction |
| **MySQL2** | v3.x | MySQL database driver |
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
| **Sequelize Migrations** | Schema versioning and management |

---

## Architecture

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
│         └───────────┴──────────────┴─────────────┘      │
│                         │                               │
│              splitKaroService.js (service layer)        │
│                         │                               │
│              splitKaroAPI.js (Axios instance)           │
└──────────────────────────┬──────────────────────────────┘
                           │  HTTP/REST (port 5173 → 3000)
┌──────────────────────────▼──────────────────────────────┐
│                        SERVER                           │
│              Node.js + Express.js (port 3000)           │
│                                                         │
│  Routes: /api/groups/*   /api/expenses/*                │
│       ↓                                                 │
│  Controllers: groupController.js  expenseController.js  │
│       ↓                                                 │
│  Services:   groupService.js      expenseService.js     │
│       ↓                                                 │
│  Sequelize ORM (Models)                                 │
│  Groups | Members | Expenses | ExpenseSplits            │
│  Settlements                                            │
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

## Project Structure

```
splitKaro/
├── backend/
│   ├── config/
│   │   └── config.js              # Sequelize DB config (reads from .env)
│   ├── controllers/
│   │   ├── groupController.js     # HTTP handlers for group-related routes
│   │   └── expenseController.js   # HTTP handlers for expense-related routes
│   ├── migrations/
│   │   ├── 20260408063521-create-groups.js
│   │   ├── 20260408063936-create-members.js
│   │   ├── 20260408064422-create-expenses.js
│   │   ├── 20260408065535-create-expense_splits.js
│   │   └── 20260409121454-create-settlements.js
│   ├── models/
│   │   ├── index.js               # Auto-loads all models, sets up associations
│   │   ├── Groups.js
│   │   ├── Members.js
│   │   ├── Expenses.js
│   │   ├── ExpenseSplits.js
│   │   └── Settlements.js
│   ├── routes/
│   │   ├── groupRoutes.js         # All /api/groups/* route definitions
│   │   └── expenseRoutes.js       # All /api/expenses/* route definitions
│   ├── seeders/                   # (Reserved for seed data)
│   ├── services/
│   │   ├── groupService.js        # Core business logic (balances, splits, settlements)
│   │   └── expenseService.js      # Expense deletion logic
│   ├── utils/
│   │   └── equalSplitAmount.js    # Precise integer-based equal-split algorithm
│   ├── .env                       # Environment variables (not committed)
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

## Database Schema

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

## API Reference

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

## Getting Started

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

   Create a `.env` file inside `backend/` (see [Environment Variables](#environment-variables)):
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=splitKaro_db
   PORT=3000
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

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | _(your password)_ |
| `DB_NAME` | MySQL database name | `splitKaro_db` |
| `PORT` | Port the Express server listens on | `3000` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for the backend API | `http://localhost:3000/api` |

> ⚠️ **Never commit your `.env` files.** Both are listed in `.gitignore`.

---

## Development Practices

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

## Roadmap

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

## License

This project is licensed under the **ISC License**.
