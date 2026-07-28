# astradx.com

Static site. No build step, no dependencies, no CMS. Edit the HTML, upload the folder, done.

## Files

```
index.html      Home — mission, problem, technology, funding, contact
careers.html    Careers — culture, open roles, how to apply
404.html        Not-found page
style.css       All styling for every page
script.js       Scroll reveals + role accordion (purely optional enhancement)
robots.txt      Allows everything, points at the sitemap
sitemap.xml     Two URLs
assets/         logo.png (1085px), favicon.png (512px)
```

## Local preview

```sh
python3 -m http.server 8787
# → http://localhost:8787
```

## Deploying

Upload the contents of this folder to the web root. That's the whole deploy.

The current host is Bluehost (`jye.ebh.mybluehost.me`) with a WordPress install
sitting underneath — `wp-admin` and `wp-login.php` still respond, even though the
public site is a hand-written `index.php`. **Two things worth doing when you cut
over:**

1. Delete `index.php` so it can't shadow the new `index.html` (or make sure
   `DirectoryIndex index.html index.php` is set).
2. Decide the fate of the WordPress install. If nothing is being served from it,
   removing it eliminates a login surface and an update treadmill you're not
   using. If you keep it, at minimum make sure it's patched.

## Editing common things

**Add or change a job posting** — `careers.html`, inside `<div class="roles">`.
Copy any `<details class="role">` block and edit the title, meta line, and body.
Roles collapse each other automatically; nothing else to wire up.

**Change contact address** — search both HTML files for `lab@astradx.com`.

**Change colors or type** — the top of `style.css` is a block of CSS custom
properties (`--ink`, `--paper`, `--slate`, `--amber`, and the font stacks).
Everything downstream reads from those, so a rebrand is a handful of lines.

**Update the copyright year** — footer of each page.

## Content provenance

Body copy is grounded in public sources rather than invented:

- CARB-X portfolio page — US$3M award (Feb 2025), 4-hour target, the 2.5M
  neonatal deaths and 7.6%-per-hour mortality figures (BARNARDS study)
- NIH/SBIR award — sub-hour AST via computational image processing
- ACS Photonics paper — the deep-learning optical AST system
- LinkedIn — company size and the four hiring areas
- The previous astradx.com — mission statement, address, logo, brand colors

The **role descriptions are drafted, not official.** The four disciplines come
from real job postings, but the bullet lists are reasonable inferences. Have
whoever owns hiring read them before this goes live.
