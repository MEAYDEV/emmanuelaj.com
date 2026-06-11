# EmmanuelAj.com

Personal website for Emmanuel Ajala. Plain HTML, CSS, and a little JavaScript. No build step, no framework.

## Files
- `index.html` — all the content
- `styles.css` — design (light and dark themes via CSS variables)
- `script.js` — theme toggle, scroll reveal, footer year

## Run locally
Open `index.html` in a browser, or:

```bash
npx serve .
```

## Deploy to Vercel
```bash
npm i -g vercel
vercel
```

Then in the Vercel dashboard: Project Settings > Domains > add `emmanuelaj.com` and follow the DNS instructions from your domain registrar (add the A record and CNAME Vercel gives you).

GitHub Pages or Netlify work just as well since this is a static site.
