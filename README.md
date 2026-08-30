# S8 Analytics LMS — Marketplace Scaffold

A working scaffold of the multi-instructor LMS marketplace described in
`S8_Analytics_Multi_Instructor_LMS_Blueprint.docx`, built with Next.js (App
Router) + Firebase + Razorpay. It runs fully against local Firebase
emulators and Razorpay test mode — no live accounts required to develop.

## What's built

- **Auth & roles** — Firebase Auth with custom claims (`student`,
  `instructor`, `admin`, `super_admin`, ...). Self-service sign-up for
  student/instructor; elevated roles must be granted server-side.
- **Public marketplace** — course catalogue with category filters, course
  detail pages, instructor storefronts, "Teach on S8" onboarding page.
- **Checkout & entitlement** — Razorpay order creation, client-side
  signature verification, and an authoritative webhook handler
  (`/api/webhooks/razorpay`) that idempotently activates enrolment — matching
  the blueprint's rule that client "success" alone must never grant access.
- **Commission ledger** — every captured order posts versioned
  `ledger_entries` (gross, platform fee, commission rate/version) per
  instructor, aggregated into a pending/available/paid earnings summary.
- **Student dashboard + learning player** — "My Learning" across all
  instructors, lesson list with progress tracking.
- **Instructor Studio** — overview (sales/earnings), course list, course
  creation, an earnings preview shown before submitting for review, and a
  submit-for-review workflow.
- **Admin Control Tower** — course approval queue (approve → published,
  reject → changes_requested), instructor list with commission rates, audit
  log writes on every approval decision, payouts placeholder.
- **Data model & security rules** — Firestore types (`src/lib/types.ts`) and
  `firestore.rules` matching blueprint section 14 (users, instructors,
  courses, lessons, enrolments, progress, orders, ledger_entries, payouts,
  reviews, certificates, audit_logs), with rules enforcing that orders,
  ledger entries and payouts are never client-writable.

## What's intentionally not built yet

These need real accounts, business decisions, or are later blueprint phases:

- Razorpay **Route** (marketplace split payments to instructor bank
  accounts) and the scheduled payout-transfer job — needs an approved Route
  account (separate KYC/approval from a normal Razorpay account).
- Live AI tutor / RAG layer (Phase 4 in the blueprint).
- Full course-builder UI (rich curriculum/lesson editor, quiz authoring,
  workbook validators, Prompt Lab) — the data model supports it; the
  authoring UI is the next iteration.
- Certificates, reviews UI, live-class scheduling, coupons.
- Production deploy to `learn.s8analytics.com` (Firebase App Hosting +
  custom domain + DNS).

## Running it locally

```bash
npm install
cp .env.local.example .env.local   # already done; defaults point at emulators

# terminal 1
npm run emulators                  # Firebase Auth + Firestore emulators

# terminal 2
npm run seed                       # creates demo admin/instructor/student + 3 courses

# terminal 3
npm run dev                        # http://localhost:3000
```

Demo logins (password: `password123`):

| Role | Email |
| --- | --- |
| Admin | admin@s8analytics.com |
| Instructor | angshuman@s8analytics.com |
| Student | student@example.com |

Try the full loop: browse `/courses` → sign in as the student → buy a course
(Razorpay test mode — use card `4111 1111 1111 1111`, any future expiry/CVV)
→ see it in `/dashboard` → mark lessons complete in `/learn/[courseId]`.
Sign in as the instructor to see `/instructor` earnings. Sign in as admin to
approve the third (draft) course in `/admin`.

## Going live — exact steps when you're ready

1. **Firebase project**: create one at console.firebase.google.com on the
   Blaze plan (required for server functions / App Hosting custom domains).
   Put the project ID, client config, and a service-account key into
   `.env.local` (`FIREBASE_ADMIN_*` / `NEXT_PUBLIC_FIREBASE_*`), and set
   `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false`.
2. **Deploy Firestore/Storage rules**: `npx firebase deploy --only
   firestore:rules,firestore:indexes,storage`.
3. **Domain**: point `learn.s8analytics.com` at Firebase App Hosting per
   https://firebase.google.com/docs/app-hosting/custom-domain (referenced in
   the blueprint's technical notes).
4. **Razorpay**: get a standard account + test-mode keys first to verify
   checkout end-to-end with real Razorpay infra; apply separately for
   **Route** (https://razorpay.com/docs/payments/route/) once you're ready
   for instructor payouts — this needs business KYC and Razorpay's approval.
   Configure the webhook URL in the Razorpay dashboard pointing at
   `/api/webhooks/razorpay` with the same secret as `RAZORPAY_WEBHOOK_SECRET`.
5. **Tax/legal**: get GST/TDS guidance for marketplace commission before
   go-live — the blueprint flags this explicitly (section 15). This changes
   how `ledger_entries` should record tax lines, so resolve it before
   finalizing the commission calculation in `src/lib/commission.ts`.
6. **Instructor payout job**: once Route is approved, build the Cloud Run
   job that reads `available` ledger entries and creates Route transfers,
   writing results into the `payouts` collection (currently just modeled,
   not automated).

## Project structure

```
src/lib/types.ts          Data model (mirrors blueprint section 14)
firestore.rules           Security rules
src/lib/commission.ts     Versioned commission-ledger calculation
src/lib/entitlement.ts    Idempotent order → enrolment activation
src/app/api/webhooks/     Razorpay webhook (authoritative payment source)
src/app/courses/          Public catalogue + course detail
src/app/instructors/      Instructor storefronts
src/app/instructor/       Instructor Studio (protected)
src/app/admin/            Admin Control Tower (protected)
src/app/dashboard/        Student "My Learning"
src/app/learn/            Learning player
scripts/seed.ts           Demo data for the emulators
```
