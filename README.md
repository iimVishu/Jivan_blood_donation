# Jeevan - Blood Donation Platform

Next.js 16, React 19 and MongoDB application for donors, recipients, hospitals and administrators. The optional Express service delivers Socket.IO notifications.

## Start locally

Use Node.js 22 LTS or newer. From this directory:

```powershell
npm --prefix frontend install
Copy-Item frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your MongoDB, NextAuth and SMTP settings.
npm run dev
```

Open http://localhost:3000. On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.

Required settings:

- `MONGODB_URI`: MongoDB Atlas or a MongoDB replica set. Completing a donation updates inventory and donor totals in a transaction; a standalone MongoDB server does not support this operation.
- `NEXTAUTH_URL`: the application's base URL.
- `NEXTAUTH_SECRET`: a strong random secret, not the example value.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: used consistently for registration, password resets, contact messages and donation receipts. Missing mail credentials now produce an error instead of silently pretending an email was sent.

See [frontend/.env.example](frontend/.env.example) for optional Google OAuth, Gemini, Razorpay and Discord settings. Existing `EMAIL_USER` and `EMAIL_PASS` are accepted as SMTP credential fallbacks. Never expose private credentials through `NEXT_PUBLIC_*` settings.

Public registration creates donor or recipient accounts. An existing administrator must assign hospital/admin roles and link hospital users to blood banks. For a fresh local database only, enable `ENABLE_DEV_SEED=true`, set `SEED_ADMIN_EMAIL` and a random `SEED_ADMIN_PASSWORD` of at least 12 characters, then visit `/api/seed` while running the development server. Disable seeding afterwards. The seed endpoint is unavailable in production.

## Checks

For the full test suite, first install the optional backend test dependencies with `npm --prefix backend install`. Run these from the repository root:

```powershell
npm run check
npm run build
```

`check` runs ESLint, TypeScript and isolated route regression tests. Tests mock external services and do not send email, charge payments or change MongoDB data.

For production locally: `npm run build`, then `npm start`. For Vercel, select `frontend` as the project root directory.

## Payments

Set Razorpay test credentials before integration testing. Order creation stores the expected amount and receipt email; completion verifies the signature, order, amount, currency and captured status on the server. Missing keys disable checkout. Test mode uses Razorpay's own test checkout rather than simulated successful donations.

## Optional notification backend

```powershell
npm --prefix backend install
Copy-Item backend/.env.example backend/.env
npm run dev:backend
```

Set the same random `NOTIFICATION_API_TOKEN` in the frontend and backend environments. Set `SOCKET_SERVER_URL=http://localhost:5000` for server broadcasts and `NEXT_PUBLIC_SOCKET_URL=http://localhost:5000` for browser subscriptions. Set backend `FRONTEND_URL` to permitted frontend origins (comma separated). Broadcasts go through an admin-only Next.js endpoint; the private token is never sent to browsers. MongoDB is optional for this service.

## Layout

- `frontend/src/app`: pages and Next.js API routes.
- `frontend/src/lib`: shared authentication, validation, mail, database and appointment workflow.
- `frontend/src/models`: Mongoose schemas.
- `frontend/tests`: regression tests.
- `backend`: optional Socket.IO service.

See [PROJECT_REVIEW.md](PROJECT_REVIEW.md) for repairs, verification limits and suggested additions. Existing Discord setup instructions are in [frontend/DISCORD_APPOINTMENT_WORKFLOW.md](frontend/DISCORD_APPOINTMENT_WORKFLOW.md).

## Security automation

The `staging` and `main` branches run dependency audits, a full-history secret
scan, lint/type checks, regression tests, a production build, and CodeQL analysis
on pushes and pull requests. Scheduled scans also run weekly. Dependabot opens
dependency updates against `staging`. See [SECURITY.md](SECURITY.md) for the checks,
private reporting guidance, and branch protection setup.
