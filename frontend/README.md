# Jeevan frontend

Next.js 16 and React 19 application. See the repository [README](../README.md) for setup, environment settings, account roles, notifications and payments.

From this directory:

```sh
npm install
npm run dev
npm run check
npm run build
```

The MongoDB connection must support transactions (Atlas or a replica set) to complete donations atomically. SMTP configuration is required for signup verification and password recovery. Optional integrations are listed in [.env.example](.env.example).
