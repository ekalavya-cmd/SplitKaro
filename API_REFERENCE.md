# API_REFERENCE.md — SplitKaro

> **Source of truth:** all endpoint shapes are derived directly from
> `backend/routes/`, `backend/controllers/`, and `backend/services/`.
> No OpenAPI, Swagger, or JSDoc annotations exist in the codebase.

---

## Conventions

### Base URL
```
http://localhost:3000/api
```
Configured via `VITE_API_URL` in the frontend `.env`.  
The backend port is set by `PORT` in the backend `.env` (default `3000`).

### Authentication
**Not implemented.** All endpoints are fully public. No token, session cookie,
or API key is required or checked.

### Content negotiation
All requests and responses use `Content-Type: application/json`.  
The frontend axios instance sets this header globally.

### Standard error shape
The backend always responds with, and the frontend axios interceptor correctly reads:
```json
{ "message": "Human-readable error description" }
```
This is fully consistent across all API endpoints, and validation/error strings are correctly passed to the frontend.

### Success response shape
All endpoints wrap their payload in an object with a `message` and data field:
```json
{ "message": "...", "<resource>": { ... } }
```
or for lists:
```json
{ "message": "...", "<plural_resource>": [...] }
```
This includes `GET /groups` (wrapped in `groups`) and `GET /groups/:id/settlements/suggest` (wrapped in `suggestions`).

### Pagination
**Not implemented.** All list endpoints return the full, unbounded result set.

### Side effects
There are **no** events emitted, background jobs queued, or webhooks fired by
any endpoint. All operations are synchronous request/response.

### Transactions
Write endpoints that touch multiple tables (`POST /groups`, `POST /groups/:id/expenses`,
`DELETE /expenses/:id`, `DELETE /groups/settlements/:id`) wrap their operations
in a Sequelize database transaction with rollback on failure.

---

## Resource: Groups

### `GET /groups`

List all groups.

**Auth:** None  
**Query params:** None  
**Request body:** None

**Response `200`**
```json
{
  "message": "Groups fetched successfully",
  "groups": [
    { "id": 1, "name": "Trip to Bali Expenses", "description": "..." },
    { "id": 2, "name": "Household Expenses",    "description": null }
  ]
}
```
`description` may be `null`.

**Error responses:** None explicitly handled — a DB error propagates as an
unhandled rejection (Express 5 converts it to a `500` with no JSON body).

---

### `GET /groups/:id`

Fetch a single group with its members.

**Auth:** None  
**Path param:** `id` — integer group ID  
**Query params:** None  
**Request body:** None

**Response `200`**
```json
{
  "id": 1,
  "name": "Trip to Bali Expenses",
  "description": "Group for managing expenses during our trip to Bali",
  "members": [
    { "id": 1, "name": "Alice", "email": "alice@example.com", "phone": "111-111-1111" },
    { "id": 2, "name": "Bob",   "email": "bob@example.com",   "phone": "222-222-2222" }
  ]
}
```
Members are ordered by `id ASC`.

**Error responses**

| Status | Body | Condition |
|---|---|---|
| `404` | `{ "message": "Group not found" }` | No group with given `:id` |
| `500` | `{ "message": "Internal Server Error" }` | Unexpected DB error |

---

### `POST /groups`

Create a new group with its initial set of members. Both the group row and all
member rows are inserted in a single database transaction.

**Auth:** None  
**Request body**
```json
{
  "name": "Weekend Trip",
  "description": "Optional group description",
  "members": [
    { "name": "Alice", "email": "alice@example.com", "phone": "111-111-1111" },
    { "name": "Bob",   "email": "bob@example.com",   "phone": "222-222-2222" }
  ]
}
```

| Field | Required | Type | Notes |
|---|---|---|---|
| `name` | Yes | string | Non-empty |
| `description` | No | string | Stored as NULL if omitted |
| `members` | Yes | array | Non-empty; each item must have `name`, `email`, and `phone` |
| `members[].name` | Yes | string | — |
| `members[].email` | Yes | string | Must be globally unique across all members in all groups |
| `members[].phone` | Yes | string | No format validation at DB level |

**Response `201`**
```json
{
  "message": "Group created successfully",
  "result": {
    "group": {
      "id": 3,
      "name": "Weekend Trip",
      "description": "Optional group description",
      "updatedAt": "2026-07-15T00:00:00.000Z",
      "createdAt": "2026-07-15T00:00:00.000Z"
    },
    "members": [
      {
        "id": 5,
        "name": "Alice",
        "email": "alice@example.com",
        "phone": "111-111-1111",
        "groupId": 3,
        "updatedAt": "...",
        "createdAt": "..."
      }
    ]
  }
}
```

**Error responses**

| Status | Body | Condition |
|---|---|---|
| `400` | `{ "message": "Group name and at least one member is required, and members must be a non-empty array" }` | `name` missing, `members` missing, or `members` is empty |
| `400` | `{ "message": "Each member must have name, email, and phone" }` | Any member object is missing a required field |
| `400` | `{ "message": "A member with this email already exists" }` | Any email is already in the `members` table (`SequelizeUniqueConstraintError`) |
| `500` | `{ "message": "Internal Server Error" }` | Unexpected DB error; transaction is rolled back |

> **Note:** Validation is split between the controller (field presence) and the
> ORM constraint (email uniqueness). There is no dedicated validation middleware.

---

## Resource: Expenses

### `GET /groups/:id/expenses`

List all expenses for a group, including payer info and per-member split details.

**Auth:** None  
**Path param:** `id` — integer group ID  
**Query params:** None  
**Request body:** None

**Response `200`**
```json
{
  "message": "Expenses fetched successfully",
  "expenses": [
    {
      "id": 1,
      "groupId": 1,
      "paidBy": 1,
      "payer": { "name": "Alice", "email": "alice@example.com" },
      "amount": "1600.00",
      "description": "Hotel booking",
      "splitType": "equal",
      "date": "2026-04-08T00:00:00.000Z",
      "splits": [
        {
          "id": 1,
          "memberId": 1,
          "member": { "name": "Alice", "email": "alice@example.com" },
          "amountOwed": "400.00"
        }
      ]
    }
  ]
}
```
Expenses are ordered by `id ASC`. Splits within each expense are ordered by
`memberId ASC`. `amount` and `amountOwed` are returned as **strings** (MySQL
`DECIMAL` serialised by Sequelize).

**Error responses**

| Status | Body | Condition |
|---|---|---|
| `404` | `{ "message": "Group not found" }` | No group with given `:id` |
| `500` | `{ "message": "Internal Server Error" }` | Unexpected DB error |

---

### `POST /groups/:id/expenses`

Add a new expense to a group. Creates one `expenses` row and one `expense_splits`
row per group member, all in a single transaction.

**Auth:** None  
**Path param:** `id` — integer group ID  
**Request body**
```json
{
  "paid_by": 1,
  "amount": 1600.00,
  "description": "Hotel booking",
  "split_type": "equal",
  "date": "2026-07-15",
  "splits": { }
}
```

| Field | Required | Type | Notes |
|---|---|---|---|
| `paid_by` | Yes | integer | Must be an `id` of a member in this group |
| `amount` | Yes | number | Must be > 0 |
| `description` | Yes | string | Non-empty |
| `split_type` | Yes | string | One of `"equal"`, `"exact"`, `"percentage"` |
| `date` | Yes | string | Any date string parseable by `new Date()` |
| `splits` | Conditional | object | Required for `"exact"` and `"percentage"`; ignored for `"equal"` |

**`splits` object shape (for `exact` and `percentage`):**
```json
{
  "<memberId>": <value>
}
```
Keys are member ID integers serialised as strings (JavaScript object keys).
Values are the amount (for `exact`) or the percentage (for `percentage`).
**Every member in the group must appear as a key** — partial splits are rejected.

**Split-type rules enforced in service:**
- `equal` — amount divided evenly; penny remainder distributed sequentially.
- `exact` — sum of all split values must equal `amount` (tolerance: ±0.01).
- `percentage` — sum of all percentages must equal `100` (tolerance: ±0.01); amounts computed server-side with penny-remainder distribution.

**Response `201`**
```json
{
  "message": "Expense created successfully",
  "expense": {
    "id": 6,
    "groupId": 1,
    "paidBy": 1,
    "amount": 1600,
    "description": "Hotel booking",
    "splitType": "equal",
    "date": "2026-07-15T00:00:00.000Z",
    "updatedAt": "...",
    "createdAt": "..."
  },
  "splits": [
    { "expenseId": 6, "memberId": 1, "amountOwed": "400.00" },
    { "expenseId": 6, "memberId": 2, "amountOwed": "400.00" }
  ]
}
```

**Error responses**

| Status | Body | Condition |
|---|---|---|
| `400` | `{ "message": "paid_by, amount, description, split_type, and date are required" }` | Any required field missing |
| `400` | `{ "message": "split_type must be 'equal', 'exact', or 'percentage'" }` | Invalid split_type value |
| `400` | `{ "message": "paid_by must be a valid member of the group" }` | `paid_by` is not a member of this group |
| `400` | `{ "message": "Invalid date format" }` | `date` is not parseable |
| `400` | `{ "message": "Amount must be greater than 0" }` | `amount` ≤ 0 |
| `400` | `{ "message": "splits object is required for exact split type" }` | `splits` missing for `exact` |
| `400` | `{ "message": "splits object is required for percentage split type" }` | `splits` missing for `percentage` |
| `400` | `{ "message": "Invalid member IDs in splits: ..." }` | A key in `splits` does not match any group member |
| `400` | `{ "message": "Missing splits for member IDs: ..." }` | A group member is absent from `splits` |
| `400` | `{ "message": "Split amounts sum to X, but total amount is Y" }` | `exact` splits don't sum to `amount` |
| `400` | `{ "message": "Percentages sum to X, but must sum to exactly 100" }` | `percentage` splits don't sum to 100 |
| `404` | `{ "message": "Group not found" }` | No group with given `:id` |
| `400` | `{ "message": "Group must have members before adding expenses" }` | Group exists but has no members |
| `500` | `{ "message": "Internal Server Error" }` | Unexpected DB error; transaction rolled back |

---

### `DELETE /expenses/:id`

Delete a single expense and all its associated `expense_splits` rows (via
database CASCADE). Wrapped in a transaction.

**Auth:** None  
**Path param:** `id` — integer expense ID  
**Request body:** None

**Response `200`**
```json
{ "message": "Expense deleted successfully" }
```

**Error responses**

| Status | Body | Condition |
|---|---|---|
| `404` | `{ "message": "Expense not found" }` | No expense with given `:id` exists |
| `500` | `{ "message": "Internal Server Error" }` | Unexpected DB error |

---

## Resource: Balances

### `GET /groups/:id/balances`

Calculate and return the net balance for every member in a group.
Balance is computed in real time from all `expenses`, `expense_splits`, and
`settlements` rows — there is no cached or pre-computed balance column.

**Formula per member:**
```
balance = total_paid - total_owed - settlements_received + settlements_paid
```
A positive balance means the member is owed money; negative means they owe money.

**Auth:** None  
**Path param:** `id` — integer group ID  
**Query params:** None  
**Request body:** None

**Response `200`**
```json
{
  "message": "Balances calculated successfully",
  "balances": [
    { "member_id": 1, "name": "Alice", "balance": 650.00 },
    { "member_id": 2, "name": "Bob",   "balance": -250.00 }
  ]
}
```
The service validates that all balances sum to zero (within ±0.01). If they
do not, it throws a `500` with a descriptive message indicating a calculation
bug.

**Error responses**

| Status | Body | Condition |
|---|---|---|
| `404` | `{ "message": "Group not found" }` | No group with given `:id` |
| `400` | `{ "message": "Group must have members" }` | Group has no members |
| `500` | `{ "message": "Balance calculation error: sum of balances (X) does not equal zero. This indicates a bug in the calculation logic." }` | Rounding error or data corruption |
| `500` | `{ "message": "Internal Server Error" }` | Unexpected DB error |

---

## Resource: Settlements

### `GET /groups/:id/settlements/suggest`

Return a minimal list of suggested payments that would clear all outstanding
balances. Uses a greedy two-pointer algorithm: largest creditor paired with
largest debtor repeatedly until all balances are zero.

**Auth:** None  
**Path param:** `id` — integer group ID  
**Query params:** None  
**Request body:** None

**Response `200`**
```json
{
  "message": "Settlement suggestions fetched successfully",
  "suggestions": [
    {
      "from": { "id": 3, "name": "Charlie" },
      "to":   { "id": 1, "name": "Alice" },
      "amount": 350.00
    }
  ]
}
```
Returns an empty array `suggestions: []` when all balances are zero (everyone is settled).

**Error responses**

| Status | Body | Condition |
|---|---|---|
| `404` | `{ "message": "Group not found" }` | Propagated from `calculateGroupBalances` |
| `400` | `{ "message": "Group must have members" }` | Propagated from `calculateGroupBalances` |
| `500` | `{ "message": "Internal Server Error" }` | Unexpected DB error |

---

### `POST /groups/:id/settlements`

Record an actual payment from one member to another. Validates that the payer
genuinely owes money and the payee is genuinely owed money, and that the
amount does not exceed what the payer owes the payee.

**Auth:** None  
**Path param:** `id` — integer group ID  
**Request body**
```json
{
  "paid_by": 2,
  "paid_to": 1,
  "amount": 250.00,
  "date": "2026-07-15"
}
```

| Field | Required | Type | Notes |
|---|---|---|---|
| `paid_by` | Yes | integer | Must be a member of this group with a negative balance |
| `paid_to` | Yes | integer | Must be a member of this group with a positive balance |
| `amount` | Yes | number | Must be > 0 and ≤ min(|payer balance|, payee balance) |
| `date` | No | string | Defaults to `new Date()` if omitted |

**Response `201`**
```json
{
  "message": "Settlement recorded successfully",
  "settlement": {
    "id": 4,
    "groupId": 1,
    "paidBy": 2,
    "paidTo": 1,
    "amount": "250.00",
    "date": "2026-07-15T00:00:00.000Z",
    "updatedAt": "...",
    "createdAt": "..."
  }
}
```

**Error responses**

| Status | Body | Condition |
|---|---|---|
| `400` | `{ "message": "paid_by, paid_to, and amount are required" }` | Any of those three fields is missing |
| `400` | `{ "message": "Cannot record settlement to yourself" }` | `paid_by === paid_to` |
| `404` | `{ "message": "Group not found" }` | No group with given `:id` |
| `400` | `{ "message": "Group must have members before recording settlements" }` | Group has no members |
| `400` | `{ "message": "paid_by must be a valid member of the group" }` | Payer not in group |
| `400` | `{ "message": "paid_to must be a valid member of the group" }` | Payee not in group |
| `400` | `{ "message": "Amount must be greater than 0" }` | `amount` ≤ 0 |
| `400` | `{ "message": "Invalid date format" }` | `date` provided but not parseable |
| `400` | `{ "message": "<name> does not owe any money" }` | Payer has a non-negative balance |
| `400` | `{ "message": "<name> is not owed any money" }` | Payee has a non-positive balance |
| `400` | `{ "message": "Amount cannot exceed <max> (what <payer> owes <payee>)" }` | Amount exceeds what the payer can pay the payee |
| `500` | `{ "message": "Error calculating balances" }` | `calculateGroupBalances` returns unexpected data |
| `500` | `{ "message": "Internal Server Error" }` | Unexpected DB error |

---

### `GET /groups/:id/settlements`

List all recorded settlements for a group, with payer and payee name/email
included.

**Auth:** None  
**Path param:** `id` — integer group ID  
**Query params:** None  
**Request body:** None

**Response `200`**
```json
{
  "message": "Settlements fetched successfully",
  "settlements": [
    {
      "id": 1,
      "groupId": 1,
      "paidBy": 2,
      "paidTo": 1,
      "payer": { "name": "Bob",   "email": "bob@example.com" },
      "payee": { "name": "Alice", "email": "alice@example.com" },
      "amount": "900.00",
      "date": "2026-04-09T00:00:00.000Z"
    }
  ]
}
```
Settlements are ordered by `id ASC`.

**Error responses**

| Status | Body | Condition |
|---|---|---|
| `404` | `{ "message": "Group not found" }` | No group with given `:id` |
| `500` | `{ "message": "Internal Server Error" }` | Unexpected DB error |

---

### `DELETE /groups/settlements/:id`

Delete a recorded settlement. Wrapped in a transaction.

**Auth:** None  
**Path param:** `id` — integer settlement ID  
**Request body:** None

**Response `200`**
```json
{ "message": "Settlement deleted successfully" }
```

**Error responses**

| Status | Body | Condition |
|---|---|---|
| `404` | `{ "message": "Settlement not found" }` | No settlement with given `:id` exists |
| `500` | `{ "message": "Internal Server Error" }` | Unexpected DB error |

> **Routing note:** The full mounted path is `/api/groups/settlements/:id`.
> The routing ambiguity is resolved by declaring the `delete("/settlements/:id", ...)`
> handler above the generic `get("/:id", ...)` handler in the router file. This
> prevents dynamic ID matches from intercepting the settlements paths.

---

## Endpoint Summary

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/groups` | List all groups |
| `POST` | `/api/groups` | Create a group with members |
| `GET` | `/api/groups/:id` | Get a group with its members |
| `GET` | `/api/groups/:id/expenses` | List all expenses for a group |
| `POST` | `/api/groups/:id/expenses` | Add an expense to a group |
| `GET` | `/api/groups/:id/balances` | Get per-member balances for a group |
| `GET` | `/api/groups/:id/settlements/suggest` | Get suggested settlement payments |
| `GET` | `/api/groups/:id/settlements` | List recorded settlements for a group |
| `POST` | `/api/groups/:id/settlements` | Record a settlement payment |
| `DELETE` | `/api/groups/settlements/:id` | Delete a settlement record |
| `DELETE` | `/api/expenses/:id` | Delete an expense and its splits |

**Total: 11 endpoints across 2 routers.**

---

## Flagged Inconsistencies (All Resolved)

| # | Issue | Affected endpoints | Resolution |
|---|---|---|---|
| 1 | `GET /groups` returns a bare array | `GET /groups` | **Resolved**: Wrapped in `{ message, groups }` on the backend. Frontend service layer unwraps it to maintain compatibility. |
| 2 | `GET /groups/:id/settlements/suggest` returns a bare array | `GET /groups/:id/settlements/suggest` | **Resolved**: Wrapped in `{ message, suggestions }` on the backend. Frontend service layer unwraps it. |
| 3 | Frontend error interceptor reads `data.error` instead of `data.message` | All endpoints | **Resolved**: Updated axios interceptor to read `data?.message`. Real backend error messages are now displayed. |
| 4 | DELETE endpoints return `500` instead of `404` for missing IDs | Both DELETE endpoints | **Resolved**: Added null guards in service layers to throw a proper `404` response. |
| 5 | `POST /groups` validates in the controller instead of the service | POST endpoints | **Resolved**: Field validation moved into the service layer, keeping error catching in the controller. |
| 6 | Error string hard-codes `₹` symbol | `POST /groups/:id/settlements` | **Resolved**: Removed `₹` from the server-side error string. |
| 7 | Routing ambiguity on `/api/groups/settlements/:id` | `DELETE /groups/settlements/:id` | **Resolved**: Moved the DELETE route above the generic dynamic ID route in the backend router file. |
