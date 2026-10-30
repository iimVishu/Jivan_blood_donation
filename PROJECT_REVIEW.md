# Project review - 30 October 2026

## Repairs

- Fixed certificate verification JSX inside try/catch and notification callback ordering errors, plus hook dependency, render purity and const warnings.
- Moved authentication options into a shared module and refreshed hospital assignments and roles from MongoDB.
- Restricted public registration to donors/recipients; protected profile fields, staff assignments, OTPs and password reset tokens.
- Added appointment ownership and hospital-bank checks, connected MongoDB before appointment lookups, and validated booking IDs/dates/bank availability.
- Made donation completion transactional across appointments, stock and donor totals. Completed donations cannot be reopened and credited again.
- Restricted request updates to the owner or staff, prevented requester reassignment and arbitrary initial approval, and added positive-integer unit validation and the missing location index.
- Protected SOS resolution, SMTP diagnostics, local seeding and notification broadcasts.
- Unified SMTP settings across signup, contact and volunteer forms; failures no longer silently report a sent email. Volunteer applications remain saved if only their email notification fails.
- Implemented server-side Razorpay verification and stored expected receipt data. Fake successful payments are disabled; repeated successful callbacks do not normally send duplicate receipts.
- Fixed Discord reschedule modal handling, malformed IDs, bot-only configuration and webhook fallback errors.
- Prevented chatbot bookings from bypassing appointment validation and permission checks.
- Stopped private page/RSC caching, added a static offline page, the missing grid asset and PWA icons, fixed service worker registration timing, and enabled browser zoom.
- Corrected blood-group field mismatches, prevented self-approval through public camp creation, removed automatic demo seeding and replaced broken footer links and placeholder contact numbers.
- Added root-level development/check scripts, regression tests and environment documentation.

## Suggested additions, in priority order

1. **Blood-unit inventory with expiry and screening states.** Track each unit or batch, collection date, expiry, component, screening result and reservation. Show usable stock separately from newly collected stock. Current stock is an aggregate counter and completion immediately increases it.
2. **Appointment capacity and conflict prevention.** Configure available slots per hospital, cap bookings and prevent duplicate active appointments. Show server-confirmed availability before booking.
3. **Reliable background reminders and email retries.** Store notification jobs, process due reminders on a schedule, record delivery outcomes and retry failures. The project currently creates reminder records but has no reliable delivery worker. Make eligibility intervals configurable and reviewed by the operating blood bank rather than hard-coding a universal interval.
4. **Payment webhooks and reconciliation.** Process signed Razorpay events idempotently, recover when a donor closes checkout before the browser callback, and provide an admin donation/receipt history. Add a durable receipt queue to recover from crashes between claiming and sending a receipt.
5. **Privacy and abuse controls.** Add persistent per-IP/account rate limits to signup, OTP, password recovery, contact, SOS and AI endpoints. Review public patient/contact information, capture consent for external messaging, support account deletion, and track administrative access to sensitive data.
6. **End-to-end tests and CI.** Exercise donor booking, hospital approval/completion, request fulfillment, role changes and payment test checkout against a disposable replica-set database. Add accessibility checks and automated dependency updates.

These priorities are based on this repository's existing features and implementation, not a claim that new integrations are already configured.

## Verification

- ESLint is run with zero warnings allowed; frontend and repository TypeScript configurations are checked.
- 18 frontend regression tests and one live backend Socket.IO integration test pass.
- Production build succeeds with Next.js 16.4.3 and React 19.3.1.
- npm audit reports zero known vulnerabilities for the root, frontend and backend dependency trees after updates. NextAuth uses explicit Nodemailer and UUID overrides; Google/Credentials authentication and shared SMTP are the configured code paths.
- Browser smoke tests cover nine public pages, mobile registration, runtime errors and missing local assets. Database responses are isolated with fixtures; the service worker cache policy has its own regression test.

To repeat browser checks after starting the production app on port 3100: `node scripts/browser-smoke.mjs`. Set `SMOKE_BASE_URL` and `SMOKE_BROWSER_PATH` when using another URL or browser installation.

## Operational notes and limits

- Completing donations requires MongoDB transactions. See [MongoDB transactions](https://www.mongodb.com/docs/manual/core/transactions/).
- Payment confirmation verifies the server's stored order and provider response. See [Razorpay Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/).
- The Turbopack root is set explicitly for this multi-package repository. See [Next.js configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack).
- Previously issued password-reset links should be requested again because reset tokens are now hashed at rest.
- Existing database indexes are not automatically migrated by these source edits; deploy the Request location index where automatic index creation is disabled.
- Automated route tests use mocked external services. Actual MongoDB transactions, Google OAuth, SMTP delivery, Discord interaction timing and Razorpay test payments require integration testing with configured services.
- Discord interactions acknowledge immediately and finish through a deferred response; a durable queue is still needed to recover jobs after process crashes. See [Discord interaction responses](https://docs.discord.com/developers/interactions/receiving-and-responding).
