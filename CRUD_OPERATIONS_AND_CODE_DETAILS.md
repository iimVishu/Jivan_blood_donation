# CRUD Operations and Code Details

This document summarizes the main create, read, update, and delete endpoints in the project, with short notes on how each route works and what the code is doing.

## Common pattern used across routes

Most API routes follow the same flow:

1. Import `NextResponse`, `dbConnect`, and the relevant Mongoose model.
2. Verify the session with `getServerSession(authOptions)` when the route is protected.
3. Parse query parameters or request body data.
4. Run a Mongoose query such as `find`, `findById`, `create`, `findByIdAndUpdate`, or `findByIdAndDelete`.
5. Return JSON with `NextResponse.json(...)` and an HTTP status code.

Common extra behavior:

- `populate(...)` is used to include related user or blood bank details.
- Some routes enforce role-based access, such as `admin`, `hospital`, or `donor`.
- Some routes write audit logs when status changes.
- Some routes trigger email notifications after updates.
- Some routes support filtering through query parameters like `status`, `range`, `days`, `lat`, and `lng`.

## 1. Appointments CRUD

### Files
- [frontend/src/app/api/appointments/route.ts](frontend/src/app/api/appointments/route.ts)
- [frontend/src/app/api/appointments/[id]/route.ts](frontend/src/app/api/appointments/[id]/route.ts)

### Endpoints
- `GET /api/appointments`
- `POST /api/appointments`
- `PUT /api/appointments/:id`

### Code details
- `GET` reads appointments from MongoDB and filters them by user role.
- Donors see only their own appointments.
- Hospitals see appointments for their linked blood banks.
- The query can also be filtered by time range using `days` and `range`.
- Appointments are populated with donor and blood bank details.
- If a donor marked their profile as anonymous, the returned donor name and phone are masked for hospital/admin views.
- `POST` creates a new appointment for the logged-in donor.
- It validates required fields: `bloodBank`, `date`, and `time`.
- New appointments start with `status: 'pending'`.
- `PUT` updates appointment status, health stats, or tracking status.
- When an appointment is marked `completed`, the code also updates donor donation count, points, and blood bank inventory.
- The update route also creates an audit log entry and sends email notifications for confirm/reject/complete events.

## 2. Blood Banks CRUD

### Files
- [frontend/src/app/api/bloodbanks/route.ts](frontend/src/app/api/bloodbanks/route.ts)
- [frontend/src/app/api/bloodbanks/[id]/route.ts](frontend/src/app/api/bloodbanks/[id]/route.ts)

### Endpoints
- `GET /api/bloodbanks`
- `POST /api/bloodbanks`
- `GET /api/bloodbanks/:id`
- `PUT /api/bloodbanks/:id`
- `DELETE /api/bloodbanks/:id`

### Code details
- `GET` can return all blood banks or only nearby ones if `lat` and `lng` are provided.
- The location filter uses MongoDB geospatial query syntax with `$near`.
- `POST` creates a new blood bank and is restricted to admins.
- `GET /:id` returns one blood bank by ID.
- `PUT /:id` updates a blood bank and allows either a system admin or a linked hospital admin.
- `DELETE /:id` removes a blood bank and is restricted to admins.

## 3. Requests CRUD

### Files
- [frontend/src/app/api/requests/route.ts](frontend/src/app/api/requests/route.ts)
- [frontend/src/app/api/requests/[id]/route.ts](frontend/src/app/api/requests/[id]/route.ts)

### Endpoints
- `GET /api/requests`
- `POST /api/requests`
- `GET /api/requests/:id`
- `PUT /api/requests/:id`
- `DELETE /api/requests/:id`

### Code details
- `GET` supports filtering by blood group, urgency, status, userId, date range, and location.
- `POST` creates a new request for the authenticated user.
- `GET /:id` returns one request with the requester profile populated.
- `PUT /:id` updates request data.
- Only admins and hospitals can change request status to values like `approved`, `rejected`, or `fulfilled`.
- Status updates create audit log records.
- `DELETE /:id` allows the requester or an admin to delete the request.

### Related endpoint
- [frontend/src/app/api/requests/[id]/fulfill/route.ts](frontend/src/app/api/requests/[id]/fulfill/route.ts)
- This is not a standard CRUD method, but it completes the request fulfillment flow.

## 4. Profile Read/Update

### File
- [frontend/src/app/api/profile/route.ts](frontend/src/app/api/profile/route.ts)

### Endpoints
- `GET /api/profile`
- `PUT /api/profile`

### Code details
- `GET` returns the current signed-in user's profile.
- `PUT` updates profile fields such as anonymous donation settings.
- This route is used by the donor dashboard to show profile data and privacy settings.

## 5. Camps CRUD

### Files
- [frontend/src/app/api/camps/route.ts](frontend/src/app/api/camps/route.ts)
- [frontend/src/app/api/admin/camps/[id]/route.ts](frontend/src/app/api/admin/camps/[id]/route.ts)

### Endpoints
- `GET /api/camps`
- `POST /api/camps`
- `PUT /api/admin/camps/:id`

### Code details
- `GET` lists camps and may support filters depending on request parameters.
- `POST` creates a new camp.
- `PUT` updates a camp from the admin area.
- These routes are part of the camp management workflow in the admin dashboard.

## 6. User and Volunteer Admin CRUD

### Files
- [frontend/src/app/api/admin/users/route.ts](frontend/src/app/api/admin/users/route.ts)
- [frontend/src/app/api/admin/users/[id]/route.ts](frontend/src/app/api/admin/users/[id]/route.ts)
- [frontend/src/app/api/admin/volunteers/route.ts](frontend/src/app/api/admin/volunteers/route.ts)
- [frontend/src/app/api/admin/volunteers/[id]/route.ts](frontend/src/app/api/admin/volunteers/[id]/route.ts)

### Endpoints
- `GET /api/admin/users`
- `DELETE /api/admin/users/:id`
- `PUT /api/admin/users/:id`
- `GET /api/admin/volunteers`
- `PUT /api/admin/volunteers/:id`
- `DELETE /api/admin/volunteers/:id`

### Code details
- These are admin-only management routes.
- They are used to review, edit, and remove users or volunteers from the system.
- They usually enforce role checks before mutating data.

## 7. Reminders CRUD

### File
- [frontend/src/app/api/reminders/route.ts](frontend/src/app/api/reminders/route.ts)

### Endpoints
- `GET /api/reminders`
- `POST /api/reminders`
- `DELETE /api/reminders`

### Code details
- `GET` reads the current user's reminders.
- `POST` creates a new reminder.
- `DELETE` removes reminders for the active user.
- This route powers donation reminder features in the dashboard.

## 8. Feedback CRUD

### File
- [frontend/src/app/api/feedback/route.ts](frontend/src/app/api/feedback/route.ts)

### Endpoints
- `GET /api/feedback`
- `POST /api/feedback`

### Code details
- `GET` reads feedback entries.
- `POST` creates feedback after a completed donation.
- The donor dashboard uses this flow to prompt users for donation feedback.

## 9. Blood donation support endpoints

These are not all classic CRUD routes, but they support create/read/update-style workflows.

### Files
- [frontend/src/app/api/sos/route.ts](frontend/src/app/api/sos/route.ts)
- [frontend/src/app/api/sos/[id]/route.ts](frontend/src/app/api/sos/[id]/route.ts)
- [frontend/src/app/api/disaster/route.ts](frontend/src/app/api/disaster/route.ts)
- [frontend/src/app/api/join/route.ts](frontend/src/app/api/join/route.ts)
- [frontend/src/app/api/contact/route.ts](frontend/src/app/api/contact/route.ts)
- [frontend/src/app/api/camps/route.ts](frontend/src/app/api/camps/route.ts)

### What they do
- `sos` creates and updates emergency SOS alerts.
- `disaster` exposes disaster alert data.
- `join` registers a user for participation or volunteering.
- `contact` stores contact form submissions.
- `camps` handles camp creation and listing.

## 10. Authentication and account flows

### Files
- [frontend/src/app/api/auth/[...nextauth]/route.ts](frontend/src/app/api/auth/[...nextauth]/route.ts)
- [frontend/src/app/api/auth/forgot-password/route.ts](frontend/src/app/api/auth/forgot-password/route.ts)
- [frontend/src/app/api/auth/reset-password/route.ts](frontend/src/app/api/auth/reset-password/route.ts)
- [frontend/src/app/api/register/route.ts](frontend/src/app/api/register/route.ts)
- [frontend/src/app/api/register/verify/route.ts](frontend/src/app/api/register/verify/route.ts)

### What they do
- These routes handle signup, login, verification, password reset, and session handling.
- They are not CRUD in the strict database sense, but they are essential to the data flow that protects the CRUD APIs.

## 11. Admin analytics and stats

### Files
- [frontend/src/app/api/admin/analytics/route.ts](frontend/src/app/api/admin/analytics/route.ts)
- [frontend/src/app/api/admin/stats/route.ts](frontend/src/app/api/admin/stats/route.ts)
- [frontend/src/app/api/public/stats/route.ts](frontend/src/app/api/public/stats/route.ts)
- [frontend/src/app/api/leaderboard/route.ts](frontend/src/app/api/leaderboard/route.ts)

### What they do
- These routes read aggregate data for dashboards and public pages.
- They are read-heavy endpoints and usually do not mutate data.

## 12. Important code patterns to notice

### Authorization
- Most protected routes call `getServerSession(authOptions)` before touching the database.
- Role checks prevent unauthorized create, update, or delete operations.

### Validation
- Some routes validate required fields before inserting records.
- Example: appointment creation requires blood bank, date, and time.

### Mongoose usage
- `create(...)` inserts new documents.
- `find(...)` and `findById(...)` read data.
- `findByIdAndUpdate(...)` updates records.
- `findByIdAndDelete(...)` deletes records.

### Audit logging
- Some update routes write to the `AuditLog` model when a record changes status.
- This is used for traceability in admin workflows.

### Email notifications
- Appointment status changes can trigger confirmation, rejection, and appreciation emails.

## Quick reference

If you want to find the main CRUD routes quickly, start here:

- Appointments: [frontend/src/app/api/appointments/route.ts](frontend/src/app/api/appointments/route.ts)
- Appointment updates: [frontend/src/app/api/appointments/[id]/route.ts](frontend/src/app/api/appointments/[id]/route.ts)
- Blood banks: [frontend/src/app/api/bloodbanks/route.ts](frontend/src/app/api/bloodbanks/route.ts)
- Blood bank details: [frontend/src/app/api/bloodbanks/[id]/route.ts](frontend/src/app/api/bloodbanks/[id]/route.ts)
- Requests: [frontend/src/app/api/requests/route.ts](frontend/src/app/api/requests/route.ts)
- Request details: [frontend/src/app/api/requests/[id]/route.ts](frontend/src/app/api/requests/[id]/route.ts)
- Profile: [frontend/src/app/api/profile/route.ts](frontend/src/app/api/profile/route.ts)
- Admin users: [frontend/src/app/api/admin/users/route.ts](frontend/src/app/api/admin/users/route.ts)
- Admin volunteers: [frontend/src/app/api/admin/volunteers/route.ts](frontend/src/app/api/admin/volunteers/route.ts)
- Reminders: [frontend/src/app/api/reminders/route.ts](frontend/src/app/api/reminders/route.ts)
- Feedback: [frontend/src/app/api/feedback/route.ts](frontend/src/app/api/feedback/route.ts)

## Notes

- This file documents the current API behavior in the repository.
- If you want, I can also turn this into a proper `README` section or generate a separate API reference table with request/response examples for every endpoint.
