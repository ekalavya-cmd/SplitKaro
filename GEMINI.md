# GEMINI.md — Agent Quickstart for SplitKaro

---

## 1. Project Context

SplitKaro is a group bill-splitting web app (Splitwise-style): users create groups, log shared expenses across three split modes (equal / exact / percentage), track per-member balances, and record debt settlements. Stack: **React 18 + Vite + Tailwind CSS v4** (frontend, ES modules, `src/`) talking to an **Express 5 + Sequelize 6 + MySQL** REST API (backend, CommonJS, port 3000). No authentication exists yet.

---

## 2. Standards

**Backend**
- Module system: CommonJS (`require` / `module.exports`)
- Layer order: `routes/` → `controllers/` → `services/` → `models/` — business logic lives only in services
- Services throw plain error objects `{ status, message }` on validation failures; controllers catch and forward them
- Multi-table writes always use a Sequelize transaction with explicit rollback
- Money: work in integer cents internally (`Math.round(amount * 100)`); store as `DECIMAL(10,2)`; distribute penny remainders sequentially
- DB column naming: `snake_case` in migrations and DB; Sequelize `underscored: true` maps to `camelCase` in JS

**Frontend**
- Module system: ES modules (`import` / `export`)
- All API calls go through `src/api/splitKaroAPI.js` (axios instance) → `src/services/splitKaroService.js` (one function per endpoint) → page component
- State: local `useState` / `useEffect` per page — no global store
- Styling: Tailwind CSS utility classes only; no inline styles, no CSS modules

---

## 3. Constraints

- **Never change the DB schema** (models, migrations, column types, FKs) without explicitly flagging the change and getting approval first
- **Keep response shapes consistent** with `API_REFERENCE.md` — do not silently add or rename fields
- **Ask before adding any new `npm` dependency** to either workspace
- **Do not introduce authentication silently** — auth is a planned but unstarted feature that will touch every layer
- **Do not add endpoints** without a corresponding entry in `API_REFERENCE.md`
- **Use `<Link>` from `react-router-dom`**, not `<a href>`, for internal navigation
- Error responses must always be `{ "message": "..." }` (not `{ "error": "..." }`)

---

## 4. Documentation Map

| File | Read when… |
|---|---|
| `ARCHITECTURE.md` | Making any structural change: new layer, new service, changing how client/server communicate |
| `DATABASE_SCHEMA.md` | Touching models, migrations, or any Sequelize query; adding/removing columns or associations |
| `API_REFERENCE.md` | Adding, modifying, or removing any route, controller function, or response shape |
| `FEATURES.md` | Checking whether something is already built/planned; **update it after every feature ships** |

---

## 5. Workflow

1. **Plan first** — for any change touching more than one file, write a short bullet-point plan and wait for approval before editing code
2. **Schema changes** — call them out explicitly at plan time; never sneak them into a larger PR
3. **After shipping a feature** — update the relevant row in `FEATURES.md` (🚧 → ✅ or ⏳ → ✅)
4. **Check known bugs before starting new work** — see `API_REFERENCE.md §Flagged Inconsistencies` and `FEATURES.md §3 Known Bugs` for the current bug list; do not layer new features on top of an unfixed bug in the same area
5. **No silent normalisation** — if a request/response shape is inconsistent with existing endpoints, flag it rather than quietly fixing it
