Portfolio website for https://mhdamn.github.io/

Clean URLs are implemented with GitHub Pages directory index files:
/about /experience /projects /skills /contact
Legacy .html URLs redirect to the clean versions.

CLEAN URLS (no trailing slash)
- Pages are flat files (about.html, experience.html, ...) and are linked as /about, /experience, /projects, /skills, /contact
- GitHub Pages serves about.html at /about. Old links such as /about/ or /about.html redirect in the browser to /about (see 404.html and script.js)
- Canonicals, Open Graph URLs, structured data and sitemap.xml all use the slash-free URLs. Resubmit sitemap.xml in Google Search Console after publishing

NAVBAR
- At the top of the page the full navigation bar is shown. After scrolling it shrinks to a small photo + name pill
- Desktop: hover or keyboard focus expands it. Mobile: the small menu button opens the dropdown
