# Test Report — mern-portfolio PR #1

One-sentence summary: Ran the client + server against MongoDB Atlas with the seeded admin, exercised the two security fixes and the session-restore fix end-to-end, plus the anonymous-contact → admin-inbox golden path.

Devin session: https://app.devin.ai/sessions/cbfdce9de8ea432b94f614b4d16b21e4

## Escalations
None. Every assertion passed. No regressions observed.

## Test results

| # | Test | Result |
|---|------|--------|
| 1 | API: anonymous `GET /api/posts?includeDrafts=true` hides drafts | passed |
| 2 | API: anonymous `GET /api/posts/gated-draft-post` returns 404 | passed |
| 3 | API: admin `GET /api/posts?includeDrafts=true` includes draft | passed |
| 4 | API: admin `GET /api/posts/gated-draft-post` returns 200 with draft | passed |
| 5 | UI: admin creates a draft post via `/admin/posts` | passed |
| 6 | UI: anonymous `/blog` list hides the draft | passed |
| 7 | UI: anonymous direct URL `/blog/gated-draft-post` shows "Post not found" | passed |
| 8 | UI: reload with corrupted access token silently refreshes and keeps admin logged in | passed |
| 9 | UI: anonymous contact form submits and appears in admin inbox | passed |

## Evidence

### Tests 1–4 — API-level draft gating (curl text evidence)

```
=== T1: anon list with includeDrafts=true ===
count: 1 slugs: ['hello-world']

=== T2: anon direct draft slug ===
HTTP/1.1 404 Not Found
{"message":"Post not found"}

=== T3: login as admin ===
token obtained, length=213

=== T3a: admin list with includeDrafts=true ===
count: 2 slugs: ['hello-world', 'gated-draft-post'] published_flags: [True, False]

=== T3b: admin direct draft slug ===
HTTP/1.1 200 OK
slug: gated-draft-post published: False title: Gated draft post
```

- Anonymous list returns only the published post; the `includeDrafts=true` query param is ignored for non-admins (fix in `server/src/routes/posts.js` `GET /`).
- Anonymous direct slug request returns a real `404`, not the draft body (fix in `server/src/routes/posts.js` `GET /:slug`).
- Admin-auth requests still see the draft at both endpoints — the fix does not over-correct.

### Test 5 — Admin creates a draft post

![Admin posts page showing the new "Gated draft post" row with amber "Draft" chip](https://app.devin.ai/attachments/eae5fd57-f004-4a17-b076-096f20ab6f54/screenshot_05dd4aa487424f2fba3789a4b1be04ba.png)

### Test 6 — Anonymous /blog hides the draft

![Anonymous blog list showing only "Hello, world — I am Robin Nasim Hossain"; no "Gated draft post"](https://app.devin.ai/attachments/da55a176-cece-4f44-a094-ab58903f7842/screenshot_0517191ec7a54361bf2b2d9f290a9b2f.png)

### Test 7 — Direct draft URL returns "Post not found"

![Anonymous direct URL /blog/gated-draft-post rendering "Post not found" with a "← Back to blog" link](https://app.devin.ai/attachments/3d9fc89e-221b-411d-a241-0d6e6c43c2b5/screenshot_5d5c64410e0743599aafe8b7c6b9b9e9.png)

### Test 8 — Session restore on reload with corrupted access token

Scripted the corruption + inspection via the page's own `localStorage`:

```
pre-corrupt:  mp_access length = 213
after set:    mp_access = "EXPIRED.AND.INVALID"
mp_refresh length (untouched) = 224

<page reload>

post-reload:  mp_access length = 213, starts with "eyJhbGci", isPlaceholder = false
```

![Admin dashboard rendered after reload — Navbar still shows "Admin" link and "Hi, Robin" / "Log out"; Blog posts count is 2](https://app.devin.ai/attachments/f9332b1c-7984-4bc1-ab20-d505eab9327e/screenshot_8201b128e9ae4a84b20390fe7ab3455a.png)

The fresh token prefix `eyJhbGci` is the base64-encoded JWT header (`{"alg":`), confirming the placeholder was replaced by a real JWT returned from `/api/auth/refresh`. Before the interceptor fix this would have dropped the session and redirected to `/login`.

### Test 9 — Contact form → admin inbox

![Anonymous /contact showing success banner "Thanks for reaching out — I'll get back to you soon."](https://app.devin.ai/attachments/9c0f6e26-cc16-49d0-8d0c-b28ebe9b4880/screenshot_41a4536492ea42f1a37417277d95b5fb.png)

![Admin /admin/messages showing Jane Recruiter <jane@acme.test> with "New" pill and body "Hi Robin, we loved your portfolio. Can we schedule a chat next week?"](https://app.devin.ai/attachments/9c623a2c-c55a-429c-9e28-346769a54b8d/screenshot_58d7d19bf5254ad386bdcfcb3a193800.png)

## Not tested
- Unit tests — none exist in the repo.
- Rate-limit edge cases on `/api/contact` — requires traffic-pattern timing beyond scope.
- Projects CRUD — unchanged since initial scaffold; covered by CI lint+build only.
- Deployment-time concerns — this run was entirely local against Atlas.

## Recording
Full screen recording of Tests 5–9 with structured annotations is attached to the user's message.
