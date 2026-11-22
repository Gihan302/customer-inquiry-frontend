# Customer Inquiry Management System — Frontend

React single-page app for the Coffee Ninja technical assessment. Staff sign in, see a dashboard, search/filter inquiries, create Public or Private inquiries, edit them and move them through the status workflow.

All rules (authentication, Public/Private access, status transitions, validation) are **enforced by the backend** ([customer-inquiry-backend](https://github.com/Gihan302/customer-inquiry-backend)); the frontend mirrors them only to guide the user. Design decisions: [DECISIONS.md](https://github.com/Gihan302/customer-inquiry-backend/blob/main/DECISIONS.md).

## Stack

React 19 · TypeScript (strict) · Vite · React Router · Tailwind CSS 4 · React Hook Form + Zod · Axios

## Setup

Prerequisites: Node.js 20+ and the **backend running** (default `http://localhost:5000`, see the backend README).

```bash
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run dev               # http://localhost:5173
```

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API base URL |

Anything prefixed `VITE_` is bundled into browser code, so **never put secrets in this file**.

The dev server is fixed to port **5173** because the backend's CORS only allows its `FRONTEND_URL` (`http://localhost:5173` by default). If you change one, change the other.

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

Test accounts (after `npm run db:seed` in the backend): `staff1@example.com` / `Password123!` and `staff2@example.com` / `Password123!`.

## Pages

| Route | Page |
|---|---|
| `/login` | Sign in (redirects back to the page you originally requested) |
| `/` | Dashboard — counts by status, your Private count, latest 5 inquiries |
| `/inquiries` | List with search, status/visibility filters and pagination (all kept in the URL) |
| `/inquiries/new` | Create an inquiry (Public or Private) |
| `/inquiries/:id` | Details, status actions, edit |

## Structure

```
src/
├── services/      api.ts (Axios instance, token, error normalisation, 401 handling),
│                  auth.service.ts, inquiry.service.ts
├── contexts/      AuthContext (signed-in user, login/logout, session check on load)
├── hooks/         useAuth, useApiData (loading + refetch on tab focus), useInquiryFilters (URL state)
├── routes/        AppRoutes, ProtectedRoute / PublicOnlyRoute
├── layouts/       DashboardLayout (header, navigation, logout)
├── pages/         Login, Dashboard, Inquiries, CreateInquiry, InquiryDetails
├── components/    common/ (Button, FormField, Alert, Spinner, Pagination, ...),
│                  inquiries/ (table, filters, badges, form, status actions), dashboard/
├── validations/   Zod schemas mirroring the backend, backend-error → form-field mapping
├── types/         API types mirroring the backend contract
└── utils/         date formatting, allowed status transitions
```

## How the assessment situations are handled

- **Invalid input** — React Hook Form + Zod show errors immediately; backend validation errors (`{ field, message }`) are displayed under the matching field, so the backend remains the authority.
- **Stale data in two tabs** — no real-time updates by design. Views refetch when the tab becomes visible again and have a Refresh button with an "Updated hh:mm:ss" label. Edits send `expected_updated_at`; if someone else saved first the API returns 409 and the page explains that the changes were **not** saved and offers "Reload latest". A status click based on an outdated view shows the real current status.
- **Direct URL to someone else's Private inquiry** — the backend answers 404, and the page shows the same "Inquiry not found" message as for an id that does not exist.

## Security notes

- The JWT is stored in `localStorage` so a page refresh keeps you signed in. Trade-off: script injected into the page (XSS) could read it. Mitigations: React escapes all rendered text (no `dangerouslySetInnerHTML`), tokens expire after 1 hour, and logout removes the token immediately. See DECISIONS.md.
- Any 401 from the API (expired/invalid token) signs the user out and shows "Your session has ended".
- Route guards only improve the experience; they are not security — the API checks every request.

## Known limitations

- No automated frontend test suite in the repository; the UI was verified with scripted headless-browser runs against the API and a test database during development.
- The API returns only the creator's id, so the UI shows "You" / "Colleague" rather than names.
- No real-time updates (see above).
