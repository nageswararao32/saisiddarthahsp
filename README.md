# HMS — Sai Siddhartha Super Speciality Hospital

Smart Hospital Management System: a role-based hospital billing and patient-credit
rewards platform for Super Admin, Billing Admin, and Patient users.

Built with React, Vite, Tailwind CSS and Framer Motion. There is no backend — all
data (patients, bills, credits, catalog, offers, notifications, etc.) is persisted
in the browser's `localStorage`, seeded once on first run from `src/data/seedData.js`.

## Getting started

```bash
npm install
npm run dev
```

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | `super_admin@gmail.com` | `123456` |
| Billing Admin | `billing_admin@gmail.com` | `123456` |
| Patient | `anitha.reddy@example.com` | `patient123` |

Patients are not fixed accounts — new patients can self-register from the login
screen's "Patient sign up" tab, or be registered by a Billing Admin (who is shown
a generated password to hand to the patient).

## Payment gateways (Razorpay / Cashfree)

Copy `.env.example` to `.env` and set your own **public** Key ID / App ID, then
restart `npm run dev`:

```
VITE_RAZORPAY_KEY_ID=rzp_live_or_test_...
VITE_CASHFREE_APP_ID=your_app_id...
```

These values can also be edited any time from **Super Admin → Payment Gateways**
without restarting anything.

**Never put a secret key in `.env` or anywhere in this frontend.** Vite bundles
`VITE_*` variables straight into the JavaScript shipped to the browser, so
anything placed here is publicly visible to every visitor. A secret key is only
ever used server-side.

- **Razorpay** opens their real hosted checkout in test mode using only the
  public Key ID above — this works with no backend (Razorpay's "Standard
  Checkout" flow doesn't require a server-created order).
- **Cashfree** remains a labeled UI simulation. Their SDK has required a
  server-created payment session for years specifically to prevent
  client-only checkout — there is no legitimate way around that without a
  small backend to create the session server-side.

## Resetting demo data

All app data lives in `localStorage` under keys prefixed `HMS:`. To reset to
the original seed data, clear site data for this origin (DevTools → Application →
Storage → Clear site data) and reload.
