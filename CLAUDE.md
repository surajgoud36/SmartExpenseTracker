# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Backend (from `server/`):
```bash
npm run dev     # start with --watch (auto-restarts on file change)
npm start       # production start
node scripts/seed.js   # wipe Expense collection and seed 6 months of random sample data
```

Frontend (from `client/`):
```bash
npm run dev     # start Vite dev server
npm run build   # production build
npm run lint    # eslint
npm run preview # preview production build
```

No test runner is configured on either side.

## Architecture

Two independent apps in one repo, run separately: `server/` (Express API) and `client/` (Vite + React 19 SPA). No shared code or types between them — the API contract is implicit and must be kept in sync by hand.

**Backend stack:** Express 5, Mongoose 9, MongoDB Atlas, ESM (`"type": "module"` — use `import`/`export` everywhere, no `require`).

**Backend request flow:** `server.js` (boot + DB connect) → `app.js` (middleware + routing) → `routes/expenseRoutes.js` → `controllers/{expenseController,summaryController}.js` → `models/Expense.js`

**Backend API:** All endpoints live under `/api/expenses`.
- `GET /` — list, `?limit=` (default 20, max 100)
- `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id` — standard CRUD
- `GET /summary` — dashboard aggregate: this/last month totals + percent change, top 5 categories this month, 6-month trend (zero-filled skeleton merged with Mongo aggregation results)
- `GET /health` (top-level, not under `/api/expenses`) — liveness check

**Data model (`models/Expense.js`):** `amount` is stored as an integer in paise (smallest currency unit) — the client converts rupees ↔ paise at the UI boundary (see `AddExpenseForm.jsx`, `lib/format.js`). `category` is an enum: `["Food", "Transport", "Shopping", "Bills", "Health", "Other"]`, duplicated in `client/src/lib/constants.js` (keep both in sync). `date` index is currently `{ date: -1 }` but is planned to become `{ userId: 1, date: -1 }` when auth lands (see Phase 5 below).

**Frontend stack:** React 19, Vite, TanStack Query (all server state), axios, Recharts.

**Frontend structure:** `App.jsx` → `Dashboard.jsx` composes the page from `components/`. All API calls go through the TanStack Query hooks in `hooks/useExpenses.js` (`useSummary`, `useExpenses`, `useCreateExpense`, `useDeleteExpense`), which call the shared axios instance in `api/client.js` (`baseURL` from `VITE_API_URL`). Mutations invalidate both the `summary` and `expenses` query keys, so adding/deleting an expense refreshes cards, charts, and the recent list together. `ChatPanel.jsx` is a disabled placeholder for Phase 4 ("AI insights") — not yet wired to any backend or LLM.

## Planned work

- **Phase 4:** Wire up `ChatPanel.jsx` to a real chat/insights backend.
- **Phase 5 (auth):** The `Expense` model reserves space for `userId` (see comment in `models/Expense.js`) — auth and per-user scoping are intentionally deferred. When adding auth, update the Mongoose index from `{ date: -1 }` to `{ userId: 1, date: -1 }`, and scope all controller queries by `userId`.

## Environment

`server/.env`:
```
PORT=3000
MONGODB_URI=<MongoDB Atlas connection string>
```

`client/.env`:
```
VITE_API_URL=http://localhost:3000/api
```

Both `.env` files must point at the same port — there's no shared config, so changing one without the other breaks local dev.
