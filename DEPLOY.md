# Deploying astradx.com to GitHub Pages

Repo: `AstraDx-Inc/astradx.com` · Live at `https://astradx.com`

The site is plain static files at the repo root, so Pages needs no build step and
no Actions workflow. Push to `main`, GitHub publishes. That's the whole pipeline.

Two files in this repo exist only for Pages:

- `CNAME` — contains `astradx.com`. Tells Pages which domain to answer for.
  **Don't delete it**; Pages rewrites it if you change the domain in Settings.
- `.nojekyll` — stops Pages from running the files through Jekyll. Nothing here
  needs it, and Jekyll silently ignores files starting with `_`.

---

## Step 0 — Make the repo public

Pages will not serve a **private** repo on a **free** org plan. `AstraDx-Inc` is
on free, so the repo has to be public (or the org upgraded to Team).

The repo contains only HTML, CSS, a 30-line JS file, and two logo PNGs — all of
it already public on the live website. There are no credentials in it.

> Settings → General → scroll to **Danger Zone** → Change visibility → Make public

## Step 1 — Turn on Pages

> Settings → Pages → **Source: Deploy from a branch** → Branch: `main`, folder
> `/ (root)` → Save

The **Custom domain** field should populate itself with `astradx.com` from the
`CNAME` file. If it doesn't, type it in and save.

At this point the site is live at `https://astradx-inc.github.io/astradx.com/`.
CSS will look broken there because the paths are relative to a domain root —
that's expected and it corrects itself once the custom domain resolves. Don't
panic at this stage and start "fixing" paths.

## Step 2 — Point DNS at GitHub

In Bluehost: **Domains → DNS / Zone Editor** for `astradx.com`.

**Delete** the existing `A` record for `@` (the bare domain) that points at a
Bluehost IP. **Add** these four in its place:

| Type | Host / Name | Value             | TTL  |
|------|-------------|-------------------|------|
| A    | `@`         | `185.199.108.153` | 3600 |
| A    | `@`         | `185.199.109.153` | 3600 |
| A    | `@`         | `185.199.110.153` | 3600 |
| A    | `@`         | `185.199.111.153` | 3600 |

Then handle `www` — **replace** whatever record currently exists for it (Bluehost
usually sets an A record or a CNAME to the domain itself):

| Type  | Host / Name | Value                    | TTL  |
|-------|-------------|--------------------------|------|
| CNAME | `www`       | `astradx-inc.github.io.` | 3600 |

Note it targets the **organization**, not the repo. No `/astradx.com` on the end.

Optionally add IPv6 alongside the A records:
`2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`

### Do not touch these

- **`MX` records.** These carry `lab@astradx.com` and point at **Google
  Workspace** (`aspmx.l.google.com` and friends). Delete them and company mail
  stops, immediately and confusingly.
- **`TXT` records** — SPF, DKIM, DMARC, and any domain-verification strings.
  They belong to mail and third-party services, not to web hosting.

You are moving *web* traffic only. Mail is a separate system that happens to
live in the same DNS zone.

### Recorded state before the change

Captured 2026-07-28, so you can put it back:

| Record | Value |
|--------|-------|
| `A` @ (Bluehost web server) | **`162.241.252.200`** ← the rollback value |
| `www` | A record → `162.241.252.200` |
| `MX` | `aspmx.l.google.com` (1), `alt1`/`alt2` (5), `alt3`/`alt4` (10) — Google Workspace |
| `TXT` @ | `v=spf1 a mx include:websitewelcome.com ~all` |
| `NS` | `ns1.bluehost.com`, `ns2.bluehost.com` |

Only the first two rows change.

## Step 3 — Wait, then force HTTPS

**There is nothing to configure for Let's Encrypt.** You don't create an account,
generate a CSR, or upload anything. Once `astradx.com` resolves to GitHub's IPs,
GitHub sees traffic arriving for a domain listed in `CNAME`, completes an ACME
HTTP-01 challenge against itself, and obtains the certificate. Renewal is
automatic and perpetual. The entire integration is "point the DNS and wait."

DNS takes anywhere from ten minutes to a few hours. Check progress with:

```sh
dig +short astradx.com          # expect the four 185.199.x.153 addresses
dig +short www.astradx.com      # expect astradx-inc.github.io
```

Once those resolve, GitHub provisions a Let's Encrypt certificate automatically —
usually minutes, occasionally up to an hour. Then:

> Settings → Pages → tick **Enforce HTTPS**

The checkbox is greyed out until the certificate exists. That's normal; it isn't
broken, it's just waiting on DNS.

## Step 4 — Verify

- `https://astradx.com` — home page, padlock in the address bar
- `https://www.astradx.com` — should redirect to the apex
- `https://astradx.com/careers.html` — careers page
- `https://astradx.com/nothing-here` — the 404 page
- `https://astradx.com/wp-login.php` — should now be **the 404 page**. Pages
  can't execute PHP, so the dormant WordPress login is gone from the internet
  the moment DNS cuts over.

---

## Making changes after launch

```sh
# edit files
git add -A
git commit -m "Update careers page"
git push
```

Live in about a minute. Check **Actions** tab if a deploy seems stuck.

## Rolling back

Leave the Bluehost hosting account active for a couple of weeks. If something
goes wrong, revert the DNS records to the Bluehost IP you deleted in Step 2 —
**write that IP down before you delete it.** That's your undo button.

To roll back a bad *content* change instead, `git revert <sha> && git push`.

## Google Workspace: no changes required

Mail and web share a DNS zone but are otherwise unrelated systems. Google
Workspace is located entirely through `MX` and `TXT` records; the web host is
located through `A` and `CNAME` records. Step 2 touches only the second set.

Nothing to change in the Workspace admin console. No re-verification, no
re-adding the domain, no downtime. Users won't notice the cutover happened.

### Pre-existing SPF issue — worth fixing, but separately

Your current SPF record is the Bluehost default:

```
v=spf1 a mx include:websitewelcome.com ~all
```

It authorizes the web server (`a`), the inbound mail hosts (`mx`), and Bluehost's
sending infrastructure — but **it never authorizes Google to send as your
domain.** Google Workspace sends from ranges that `_spf.google.com` covers and
this record does not. Some receivers are consequently softer on mail from
`@astradx.com` than they should be.

This is a pre-existing condition, not something the migration causes. It's worth
correcting to:

```
v=spf1 include:_spf.google.com ~all
```

**Do it as its own change, on its own day** — not bundled into the web cutover.
If mail deliverability shifts, you want exactly one variable to have moved. The
`a` and `mx` mechanisms are safe to drop once no mail originates from the
Bluehost server, which after this migration is the case.

While you're in there: there's **no DMARC record** on the domain and no Google
DKIM selector published. Enabling DKIM in the Workspace admin console and adding
a monitoring-only DMARC policy (`v=DMARC1; p=none; rua=mailto:...`) is the
standard follow-up. Again — separate change, separate day.

## Optional hardening

**Verify the domain for the org** (Organization settings → Verified domains).
This prevents anyone else from claiming `astradx.com` on their own Pages site if
your DNS records ever go stale.

**Deal with the old Bluehost install** once you're confident in the cutover. The
WordPress files sit in `public_html` and are unreachable via the domain after
Step 2, but they still exist on a server that's still running. Delete the `wp-*`
files by hand in File Manager — **not** via the control panel's "uninstall
WordPress" button, which removes the whole install directory.
