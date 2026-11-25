# Personal portfolio site

Source for a static personal portfolio site.

## Stack
- Static HTML, CSS and a small vanilla JavaScript file. No framework, no build step, no dependencies.
- Hosted on Cloudflare Workers (static assets), deployed from this repository.
- System fonts only. No third-party scripts, fonts, analytics or trackers.

## Security choices
- HTTPS only, with HSTS.
- Strict Content Security Policy: everything loads from this domain; no inline scripts or styles.
- The page cannot be embedded in other sites.
- Locked-down browser permissions, referrer and cross-origin policies (see `public/_headers`).
- No forms, no user input, no cookies, no storage, no secrets in the repository.
- Security contact in `public/.well-known/security.txt` (RFC 9116).

## Accessibility and resilience
- All content is readable with JavaScript turned off; scripts only add motion.
- Honours reduced-motion settings; keyboard and screen-reader friendly; print-friendly.

## Layout
- `public/` – the site (served as-is)
- `public/_headers` – security and caching headers
- `wrangler.jsonc` – Cloudflare configuration

CSS and JS file names carry a version (for example `site.2026112501.css`). When either changes, bump the version in the file name and in `index.html` and `404.html`.
