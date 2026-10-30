# Discord appointment workflow

The appointment webhook now includes admin action buttons:

- Approve, reject, cancel, and reschedule pending appointments
- Mark confirmed appointments complete
- Update donation tracking: collected, testing, processing, ready, and transfused
- Send the same donor email, audit log, inventory, and donor-stat updates as the web admin dashboard

## Required environment variables

Add these to `frontend/.env.local`:

```env
DISCORD_WEBHOOK_URL=your_incoming_webhook_url
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CHANNEL_ID=your_discord_channel_id
DISCORD_PUBLIC_KEY=your_discord_application_public_key
DISCORD_ADMIN_USER_IDS=discord_user_id_1,discord_user_id_2
DISCORD_ADMIN_ROLE_IDS=discord_role_id_1
DISCORD_ADMIN_MONGODB_USER_ID=the_admin_user_object_id_in_mongodb
```

At least one of `DISCORD_ADMIN_USER_IDS` or `DISCORD_ADMIN_ROLE_IDS` must match the person or role allowed to click the buttons. `DISCORD_ADMIN_MONGODB_USER_ID` is the application admin account used for audit log ownership.

`DISCORD_BOT_TOKEN` and `DISCORD_CHANNEL_ID` are required for interactive buttons. The incoming webhook remains useful for notifications, but ordinary incoming webhooks cannot create interactive buttons.

## Discord Developer Portal

1. Create or open the Discord application that owns the webhook.
2. Copy its **Public Key** into `DISCORD_PUBLIC_KEY`.
3. Set **Interactions Endpoint URL** to:
   `https://your-public-domain.example/api/discord/interactions`
4. Copy the Discord user ID or role ID for the admins into the allowlist variables.
5. Restart the Next.js server after changing environment variables.

The interactions endpoint must be publicly reachable over HTTPS. For local development, use an HTTPS tunnel such as Cloudflare Tunnel or ngrok and set the resulting URL as the Discord endpoint. `localhost:3000` cannot receive Discord callbacks directly.

The endpoint verifies every request with Discord's Ed25519 signature and rejects unauthorized users. Do not expose the webhook URL or application secrets in source control. Rotate the webhook if it has been shared publicly.

## Replay protection

Signed requests are accepted only within five minutes of their timestamp, with
up to 30 seconds of future clock skew. Keep application server clocks synchronized.
Discord's endpoint verification PING remains independent of MongoDB.

Before changing an appointment, the deferred handler inserts a receipt keyed by
`application_id:interaction_id` into `DiscordInteractionReceipt`, with majority
write acknowledgement. MongoDB's built-in unique `_id` index makes that claim
atomic across workers and server restarts. A duplicate delivery does not apply
another update or overwrite the original Discord response.

Receipt storage failures stop processing. Receipts remain consumed when an
operation fails, so replaying a partially completed operation cannot repeat its
side effects. Use a new Discord action or the dashboard to retry after checking
the appointment's state. This provides at-most-once execution, not a durable job
queue or guaranteed completion after a process crash.

Receipts contain only the two IDs and an expiry time; tokens and request bodies
are not stored. A TTL index cleans them up after 24 hours. If automatic index
creation is disabled, create `{ expiresAt: 1 }` with `expireAfterSeconds: 0` on
`discordinteractionreceipts` to enable cleanup. Replay safety does not depend on
that TTL index: `_id` uniqueness is built in, and expired signatures are rejected.
