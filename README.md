# astradx.com

A plain static website. Five files, no build step, no dependencies.

```
index.html     Home page
careers.html   Careers page
style.css      Styling for both pages
robots.txt     For search engines
sitemap.xml    For search engines
assets/        logo.png, favicon.png
```

## Editing a job posting

Open `careers.html`. The jobs are near the bottom, and there are instructions in
a comment right above them. Each job is one block:

```html
<div class="job">
  <h2>Job title goes here</h2>
  <p>One or two sentences about the job.</p>
</div>
```

Copy a block to add a job, delete a block to remove one, change the words to
edit one. Nothing else needs to be touched.

## Publishing a change

```sh
git add -A
git commit -m "Update careers page"
git push
```

GitHub Pages rebuilds automatically, live in about a minute.

## Preview locally

```sh
python3 -m http.server 8787
```

Then open http://localhost:8787

## Hosting

GitHub Pages, from the `main` branch of `AstraDx-Inc/astradx.com`.

The `CNAME` file holds the domain the site answers on. It currently says
`test.astradx.com`. To go live on the real domain, change it to `astradx.com`
and update the DNS records at Bluehost:

- Replace the `A` record for `@` (currently `162.241.252.200`, the Bluehost
  server — **write that down first**, it's the way back) with the four GitHub
  addresses: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
  `185.199.111.153`
- Point `www` at `astradx-inc.github.io.` with a `CNAME` record

**Do not touch the `MX` or `TXT` records.** Those run Google Workspace email
(`lab@astradx.com`) and have nothing to do with the website. HTTPS is automatic;
there is nothing to configure.
