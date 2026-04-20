# Test Plan — mern-portfolio PR #1

## What changed (user-visible)
- **Security**: Unpublished blog posts are no longer reachable by anonymous users — neither in the list (`GET /api/posts?includeDrafts=true`) nor by direct slug (`GET /api/posts/:slug`). Only authenticated admins can see drafts.
- **Session restore**: Reloading the page with an expired access token but a valid refresh token now silently refreshes instead of logging the user out.
- **Golden path**: Production-grade MERN portfolio with JWT auth — register/login/logout, admin dashboard for projects/posts/messages, public contact form.

## Scope
One recording covering the golden-path UI flow + session-restore. Draft-gating is verified via `curl` text evidence (much less ambiguous than "I opened a URL and got a 404 page").

---

## Test 1 (API) — Anonymous cannot list drafts
**Trigger**: `curl -s http://localhost:4000/api/posts?includeDrafts=true`
**Expected**: Response JSON contains only items where `published === true`. The seeded draft (created in Test 4 below) must NOT appear.
**Pass/fail criteria**:
- ✅ Pass: `items[].slug` does **not** contain `gated-draft-post`.
- ❌ Fail: `gated-draft-post` appears in `items`.
**Why this distinguishes**: Before fix, `includeDrafts=true` with no auth returned drafts. After fix, server ignores the param unless `req.user.role === 'admin'`.

## Test 2 (API) — Anonymous cannot fetch a draft by slug
**Trigger**: `curl -i http://localhost:4000/api/posts/gated-draft-post`
**Expected**: HTTP **404** with body `{"message":"Post not found"}`.
**Pass/fail criteria**:
- ✅ Pass: status line is `HTTP/1.1 404` and body message is `Post not found`.
- ❌ Fail: 200 with the draft post body, or any 2xx.
**Why this distinguishes**: Before fix, `GET /api/posts/:slug` returned any matching doc regardless of `published`. After fix, the query adds `published: true` for non-admins.

## Test 3 (API) — Admin CAN see drafts via both endpoints
**Trigger**: Log in as `admin@robinnasim.dev`, capture `accessToken`, then
1. `curl -H "Authorization: Bearer <token>" http://localhost:4000/api/posts?includeDrafts=true`
2. `curl -H "Authorization: Bearer <token>" http://localhost:4000/api/posts/gated-draft-post`
**Expected**:
- (1) `items[]` includes the draft (`slug: 'gated-draft-post'`, `published: false`).
- (2) HTTP 200 with the full draft body.
**Pass/fail criteria**:
- ✅ Pass: both responses contain the draft.
- ❌ Fail: either returns 404 / missing the draft.
**Why this distinguishes**: Confirms the fix didn't over-correct and lock admins out of their own drafts.

## Test 4 (UI, recorded) — Golden path: admin creates a draft, public cannot see it
**Steps**:
1. Browse to `http://localhost:5173/` as anonymous. **Assertion**: Home shows "Robin Nasim Hossain" hero and seeded featured projects render (count ≥ 1).
2. Navigate to `/blog`. **Assertion**: Only the seeded welcome post appears (card list length = 1 before Test 4 runs).
3. Navigate to `/login`, sign in as `admin@robinnasim.dev` / `ChangeMe!2025`. **Assertion**: Navbar now shows an "Admin" link, redirected to `/admin`.
4. Go to `/admin/posts`. Fill form: Title=`Gated draft post`, Slug=`gated-draft-post`, Content=`This should be hidden from the world.`, leave "Publish" unchecked. Click **Create post**. **Assertion**: Post appears in the "All posts" list with an amber `Draft` chip.
5. Log out (Navbar → Logout). **Assertion**: Navbar returns to guest state ("Login"/"Register" visible, "Admin" gone).
6. Visit `/blog` as anonymous. **Assertion**: `Gated draft post` is **not** in the list; only the original published post remains.
7. Visit `/blog/gated-draft-post` directly. **Assertion**: The page renders a "not found / failed" state, not the draft body. (UI shows "Failed to load post" per `BlogDetailPage`.)

**Pass/fail criteria per step** are listed inline above.

**Why this distinguishes**: Every step would look visibly different if the fix were not applied (the draft card would appear on `/blog`, and the direct URL would render the post body).

## Test 5 (UI, recorded) — Session survives access-token expiry on reload
**Setup**: Still on the site after log-in (via step 3 above) or re-login.
**Steps**:
1. Open devtools → Application → Local Storage → `http://localhost:5173`.
2. Note both `mp_access` and `mp_refresh` are present. **Assertion**: both keys exist with non-empty values.
3. Edit `mp_access` and replace its value with `EXPIRED.AND.INVALID` (leaves `mp_refresh` untouched). Close devtools.
4. Reload the page (Ctrl+R).
5. **Assertion A**: Page renders logged-in chrome (Navbar shows "Admin" link, not "Login"). The user is NOT bounced to guest state.
6. **Assertion B**: In devtools Network tab (opened after reload), `/api/auth/me` initially returns 401, followed by `/api/auth/refresh` returning 200, followed by a retried `/api/auth/me` returning 200.
7. **Assertion C**: Local storage `mp_access` now holds a fresh non-`EXPIRED` JWT.

**Why this distinguishes**: Before the fix, step 5 would show the user logged out (interceptor short-circuited on any `/auth/` URL). After the fix, the interceptor only skips `/auth/login|register|refresh`, so `/auth/me` does trigger a silent refresh.

## Test 6 (UI, recorded, brief) — Anonymous contact form + admin inbox
**Steps**:
1. While logged out, visit `/contact`, fill Name=`Tester`, Email=`tester@example.com`, Message=`Hello from Devin test.`, submit. **Assertion**: Success banner reads "Message sent" (or similar from `ContactPage`).
2. Log back in as admin, go to `/admin/messages`. **Assertion**: The message appears at the top with the text `Hello from Devin test.` and is marked unread (styled differently from read).

**Why this distinguishes**: Proves the write-path from public → DB → admin read-path works end-to-end and rate limiting doesn't accidentally block legitimate single submits.

---

## What I am **not** testing
- CI itself (already green for this PR).
- Lint/build/unit tests (no unit tests in the repo).
- Rate-limit enforcement edges (would require timing and traffic patterns beyond scope).
- Every admin page (only posts and messages are exercised; projects CRUD is unchanged since initial scaffold and was verified by lint/build only).

## Evidence I will capture
- Screen recording for Tests 4, 5, 6 with `computer.record_annotate` markers at each named step.
- Text capture (copy-pasted from curl) for Tests 1–3, included in the final PR report under a `<details>` section.
- Screenshots attached to `test-report.md`.
