# INFORMATION ARCHITECTURE

## Page Inventory
- **Home:** `index.html` (Authoritative primary page)
- **About:** `about.html`
- **Products:** `products.html`
- **Services:** `services.html`
- **FAQ:** `faq.html`
- **AI Discoverability:** `ai.html`

## Missing Pages / Trust Signals
- **Privacy Policy:** Currently a dead link (`#`) in the footer.
- **Terms of Service:** Currently a dead link (`#`) in the footer.
- **Quality Certification:** Currently a dead link (`#`) in the footer.
- *Recommendation:* Generate placeholder `.html` pages for these or apply `TODO` flags, as they are critical Trust Signals for SEO and Knowledge Graph validation.

## Orphan Pages Analysis
- `about.html`, `products.html`, `services.html`, `faq.html`, and `ai.html` are currently only linked from the `footer__bottom-links` on `index.html`. 
- **Deficiency:** The main top navigation (`<nav class="nav__links">`) on `index.html` uses hash-links (`#about`, `#products`) instead of pointing to the newly generated pages, meaning the new pages are functionally "orphaned" from the primary human navigation flow.

## Content Strength
- **index.html:** Strong, deep content covering the entire business spectrum.
- **Sub-pages:** Relatively thin. They contain the baseline information but lack the deep contextual richness found on the single-page `index.html`.
- *Action Required:* Internal cross-linking must be established. The sub-pages need semantic structure upgrades to prevent search engines from classifying them as "Thin Content" relative to `index.html`.
