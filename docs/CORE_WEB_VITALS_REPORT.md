# Core Web Vitals Report

## Overview
Core Web Vitals are key metrics that Google uses to evaluate user experience, specifically regarding loading speed (LCP), visual stability (CLS), and interactivity (INP).

## Metric Improvements

### 1. Largest Contentful Paint (LCP)
- **Before:** The hero image (`mushrrom house`) was discovered late during HTML parsing, delaying LCP.
- **After:** The hero image is explicitly preloaded in the `<head>` using `<link rel="preload" as="image" fetchpriority="high">`. This ensures the browser begins fetching the LCP element immediately upon receiving the HTML document.

### 2. Cumulative Layout Shift (CLS)
- **Before:** The `about__image` on the homepage lacked an explicit `height` attribute. As it loaded asynchronously, the browser could not pre-allocate layout space, risking a layout shift.
- **After:** All `<img>` tags now possess explicit `width` and `height` attributes (e.g., `width="600" height="450"` on the About image), allowing the browser to reserve the exact visual real estate before the image payload arrives.

### 3. Interaction to Next Paint (INP)
- **Before:** `main.js` and external Google Font requests via CSS `@import` could potentially block the main thread and delay interactivity.
- **After:** The removal of the CSS `@import` and the addition of `defer` on `main.js` minimizes main thread blocking, allowing the browser to prioritize user input faster.

## Risk Assessment
- **UI Risk**: Low. Explicit dimensions were calculated safely based on CSS rules and natural aspect ratios.
- **Functional Risk**: Low. `defer` handles script execution gracefully at the end of DOM parsing without breaking JS functionality.
- **Performance Risk**: Positive. Guaranteed improvement in Lighthouse profiling.

## Rollback Strategy
If layout shifts occur on unknown screen sizes due to the injected `height` attributes, remove `height="450"` from line 307 of `index.html`. If fonts fail to load, revert `styles.css` to include the `@import`.
