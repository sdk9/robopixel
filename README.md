# RobotCodeHub

RobotCodeHub is a TanStack Start learning platform for Ubuntu, C++23, ROS 2 Lyrical and simulation-first industrial robotics.

## Local development

Requirements: Node.js 22 or later and npm.

```bash
npm install
copy .env.example .env.development
npm run dev
```

Use `npm run check` before publishing. It runs TypeScript, ESLint, unit tests and the production build. `npm run images:optimize` regenerates the responsive WebP course artwork after an original PNG changes.

After a build, `npm run preview -- --ip 127.0.0.1 --port 4173` serves the generated Cloudflare/Nitro artifact locally.

## Database

Apply every migration in `supabase/migrations` in order. The production-hardening migration adds server-only signup and practice writes, checkout purchase intents, retryable payment events and database-backed rate limits.

Never expose `SUPABASE_SERVICE_ROLE_KEY`, Paddle connection keys, webhook secrets or `RATE_LIMIT_SALT` to browser code.

## Payments

Create the Paddle price with external ID `industrial_robots_one_time`. Configure separate webhook URLs:

- Sandbox: `/api/public/payments/webhook?env=sandbox`
- Live: `/api/public/payments/webhook?env=live`

Subscribe to `transaction.completed`, `transaction.payment_failed`, `adjustment.created`, and `adjustment.updated`. Live checkout remains blocked until the public seller identity, postal address and governing-law variables from `.env.example` are configured.

## Release checklist

1. Apply and verify database migrations.
2. Run `npm run check` and `npm audit`.
3. Test email/password and Google sign-in on the production domain.
4. Complete a sandbox purchase, full refund, partial refund, dispute and dispute reversal.
5. Confirm an unauthenticated industrial lesson response contains no paid lesson body.
6. Review the legal pages with counsel for the operator's actual jurisdiction.

The repository is connected to Lovable. Keep published history intact; do not force-push or rewrite pushed commits.
