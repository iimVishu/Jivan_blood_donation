# Jeevan — Blood Donation Platform

This repository contains the code for "Jeevan", a community blood donation platform with a Next.js frontend and a Node.js backend. It supports donor scheduling, hospital management, donation tracking, badges, reminders, and admin workflows.

**Repository layout**

- [frontend](frontend): Next.js 13+ application (React, App Router, API routes). This hosts the user-facing UI and many serverless API endpoints.
- [backend](backend): Optional Express/Node API server used for legacy or separate deployments.
- Other files: `package.json`, `tsconfig.json`, deployment config and docs.

**Key features**

- Donor: Book appointments, view donation history, download certificates, health vitals tracking, digital donor ID.
- Hospital/Admin: View and confirm appointments, manage blood banks and camps, view analytics.
- Notifications: Donation reminders and emergency alerts.

## Prerequisites

- Node.js 18+ (recommended)
- npm 8+ or yarn
- A MongoDB instance (Atlas, local, or cloud provider)

## Quickstart — Frontend (development)

1. Install dependencies and run the Next.js app:

```bash
cd frontend
npm install
npm run dev
```

2. Open your browser at `http://localhost:3000`.

Notes:
- The frontend uses NextAuth for authentication. During development you may need to set `NEXTAUTH_URL` and `NEXTAUTH_SECRET` in your environment.

## Quickstart — Backend (development)

The backend is optional; the Next.js app contains many server routes. If you run the `backend` service, do the following:

```bash
cd backend
npm install
npm run dev
```

Backend runs by default on `http://localhost:5000` (check `backend/package.json` scripts).

## Environment variables

Create a `.env` file in both `frontend` and `backend` (if you use it). Typical variables include:

- `MONGODB_URI` — MongoDB connection string
- `NEXTAUTH_SECRET` — NextAuth secret
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` — for Google OAuth
- `NEXTAUTH_URL` — e.g. `http://localhost:3000`
- `SENDGRID_API_KEY` or SMTP details — for transactional emails

Adjust services according to your provider. Do NOT commit secrets to git.

## Database migrations & models

- The project uses Mongoose models stored under `frontend/src/models` (e.g., `User.ts`, `Appointment.ts`). There is no automated migration system included — ensure model changes are applied carefully in staging/production.

## Testing & Linting

Run the frontend linter and tests (if present):

```bash
cd frontend
npm run lint
npm run test  # if tests are configured
```

## Deployment

- Frontend: Deploy the `frontend` directory to Vercel for the easiest experience. Ensure environment variables are configured in the Vercel dashboard.
- Backend: Deploy `backend` to your chosen host (Render, Railway, Heroku). Point the frontend API calls to the deployed backend if you use it.

## Contributing

1. Fork the repository and create a feature branch: `git checkout -b feat/my-change`
2. Implement changes and run lint/tests locally.
3. Open a PR describing the change and link any relevant issue.

## Useful file locations

- Main donor dashboard: `frontend/src/app/dashboard/donor/page.tsx`
- App API routes: `frontend/src/app/api`
- Mongoose models: `frontend/src/models`

## Contact & Support

If you need help, open an issue or contact the maintainers listed in the repo. For urgent production incidents, use the project's incident escalation process (if configured).

---

If you'd like, I can also:

- Add a detailed `env.example` with recommended variables.
- Add a short developer setup script to bootstrap the environment.
- Run the linter and commit the README update for you.
