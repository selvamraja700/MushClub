# PERFORMANCE REPORT

## Current State Analysis (Baseline)

### Core Web Vitals (Estimated)
- **LCP (Largest Contentful Paint):** High Risk. Hero images (via ImageKit) and custom Google Fonts are not preloaded. The browser discovers them late in the waterfall.
- **CLS (Cumulative Layout Shift):** Moderate Risk. `<img>` tags lack explicit `width` and `height` attributes, causing potential shifts as network images render.
- **INP (Interaction to Next Paint):** Low Risk. `main.js` is 42KB uncompressed; execution time should be well within the <200ms budget, but can be deferred.
- **TTFB (Time to First Byte):** Handled by Netlify Edge (Excellent).

### Asset Loading
- `styles.css` (66 KB) is fully render-blocking in the `<head>`.
- `main.js` (42 KB) is located at the bottom of the `<body>`, which is good for unblocking paint, but lacks the `defer` attribute.
- Image assets lack `loading="lazy"` for below-the-fold content and `decoding="async"`.

### CSS & JavaScript Duplication
- **Unused CSS:** 66 KB of CSS is loaded globally, even on thin pages like `faq.html`. This indicates unused CSS overhead on sub-pages.
- **Minification:** Assets are currently served raw/unminified, increasing payload size over the wire by approximately ~30-40%.

## Target Budgets
- **LCP:** < 2.5s
- **CLS:** < 0.1
- **INP:** < 200ms
- **TTFB:** < 800ms

## Proposed Action Plan
1. Add `<link rel="preload" as="image" href="[HERO_IMAGE_URL]" fetchpriority="high">` to `<head>`.
2. Add `<link rel="preload" as="style" href="css/styles.css">`.
3. Append `width` and `height` properties to all `<img>` tags.
4. Append `loading="lazy" decoding="async"` to all non-hero images.
5. Add `defer` attribute to the `<script>` tag.
