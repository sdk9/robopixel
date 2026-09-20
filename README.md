# Code The Robot

Code The Robot is a TanStack Start learning platform for Ubuntu, C++17, ROS 2 Lyrical and simulation-first industrial robotics.

## Local development

Requirements: Node.js 22 or later and npm.

```bash
npm install
copy .env.example .env.development
npm run dev
```

Use `npm run check` before publishing. It runs TypeScript, ESLint, unit tests and the production build. `npm run images:optimize` regenerates the responsive WebP course artwork after an original PNG changes.

After a build, `npm run preview -- --ip 127.0.0.1 --port 4173` serves the generated Cloudflare/Nitro artifact locally.

## Industrial robot pixel art

The seven interactive robot labs use editable Aseprite sources in `art/robots` and browser-ready
sprite sheets in `public/images/robots`. With Aseprite installed in its default Steam location on
Windows, regenerate both sets with:

```bash
npm run sprites:generate
```

`art/build-robots.lua` is the source of truth for robot poses, animation frames and scene
backgrounds. Keep hard pixel edges and the existing canvas sizes when refining a sprite so the
code-driven SVG scene remains aligned with its waypoints.

## Database

Apply every migration in `supabase/migrations` in order. The production-hardening migration adds server-only signup and practice writes, checkout purchase intents, retryable payment events and database-backed rate limits.

Never expose `SUPABASE_SERVICE_ROLE_KEY`, Paddle API keys, webhook secrets or `RATE_LIMIT_SALT` to browser code.

## Payments

Create one-time Paddle prices for the Industrial Robots course in both sandbox and live, then set
`PADDLE_SANDBOX_PRICE_ID` and `PADDLE_LIVE_PRICE_ID` to their `pri_...` IDs. Configure separate
webhook URLs:

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
