# Internal Link Graph

## Overview
This document maps the complete internal linking architecture of the MushClub domain, ensuring crawlers can trace paths to every canonical page.

## Link Map
- `index.html` (Homepage)
  - Navigation: Scroll-to hashes (`#hero`, `#about`, `#products`, `#faq`, `#contact`)
  - Footer: Canonical Links (`index.html`, `about.html`, `products.html`, `services.html`, `faq.html`, `index.html#contact`)
  - Mobile Menu Footer: Canonical Links (`about.html`, `products.html`, `services.html`, `faq.html`, `ai.html`)

- `about.html`
  - Navigation: Canonical Links (`index.html`, `about.html`, `products.html`, `services.html`, `faq.html`)
  - Contextual: `products.html`, `faq.html`
  - Footer: Canonical Links to all primary pages.

- `products.html`
  - Navigation: Canonical Links
  - Contextual: `services.html` (Wholesale inquiry)
  - Footer: Canonical Links

- `services.html`
  - Navigation: Canonical Links
  - Contextual: `index.html#contact` (Contact/Partnership inquiry)
  - Footer: Canonical Links

- `faq.html`
  - Navigation: Canonical Links
  - Contextual: `index.html#contact` (Support inquiry)
  - Footer: Canonical Links

- `ai.html`
  - Navigation: Canonical Links
  - Footer: Canonical Links

## Orphan Pages Resolved
No orphan pages remain. All 6 HTML files are bidirectionally linked via the global footer matrix, guaranteeing a maximum crawl depth of 1 from the homepage.
