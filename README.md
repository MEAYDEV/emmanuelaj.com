# EmmanuelAj.com

Personal website for Emmanuel Ajala. Plain HTML, CSS, and a little JavaScript. No build step, no framework.

## Files
- `index.html` — all the content
- `styles.css` — layout, hero, and section styling
- `script.js` — scroll reveal, hero effects, beats player
- `assets/images/hero-portrait.png` — hero portrait (replace with your own file if you prefer)

### Animated hero (optional)
To use a looping portrait from [Higgsfield AI](https://higgsfield.ai/) or [open-generative-ai](https://github.com/anil-matcha/open-generative-ai), export a short `.webm` or `.mp4` and add a `<video>` inside `.portrait-frame` in `index.html` (poster=`hero-portrait.png`).

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
