# Operations & Maintenance Guide

## Overview
This document outlines the standard operating procedures required to keep the MushClub website secure, performant, and visible.

## Routine Maintenance Tasks

### 1. Broken Link Checks
- **Frequency**: Monthly
- **Action**: Run a crawler tool (e.g., Screaming Frog or W3C Link Checker) against `https://mushclub.in` to ensure no internal links or external references yield 404s.

### 2. Lighthouse Audits
- **Frequency**: After every code deployment.
- **Action**: Open Chrome DevTools > Lighthouse. Run a Mobile & Desktop report. Ensure Performance, Accessibility, Best Practices, and SEO scores remain above 90.

### 3. Structured Data Validation
- **Frequency**: When modifying `products.html`, `services.html`, or `index.html`.
- **Action**: Use the [Google Rich Results Test](https://search.google.com/test/rich-results) to verify the JSON-LD payload remains valid.

### 4. Sitemap Validation
- **Frequency**: Whenever a new `.html` page is added or removed.
- **Action**: Ensure the `<loc>` tags in `sitemap.xml` perfectly mirror the live canonical URLs.

### 5. Dependency Updates
- **Frequency**: Quarterly.
- **Action**: Since this is a static site, monitor changes to the Google Fonts API or ImageKit delivery systems. Ensure `main.js` remains vanilla and independent of deprecated libraries (e.g., jQuery).

### 6. SSL Certificate Monitoring
- **Frequency**: Automated.
- **Action**: Ensure Netlify's automatic Let's Encrypt certificate renewal is actively functioning. Check the padlock icon in the browser periodically.
