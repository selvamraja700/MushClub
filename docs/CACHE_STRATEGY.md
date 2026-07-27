# Caching Strategy Report

## Executive Summary
The Service Worker (`sw.js`) intercepts all network requests made by the browser. To balance offline capability with the need for fresh content, we have implemented a dual-strategy approach in the `fetch` event listener.

## Caching Strategies

### 1. HTML Pages (Navigation): Network-First
When the browser requests an HTML document (e.g., navigating to `/about.html`), the Service Worker attempts to fetch it from the live network first.
- **Success**: The user receives the most up-to-date content from the server.
- **Failure**: If the network request fails (user is offline), the Service Worker catches the error and responds with the pre-cached `/offline.html` page.

*Why Network-First?* HTML pages contain critical text and pricing updates. Serving them from the cache first would cause users to see outdated information until a background sync occurred.

### 2. Static Assets (CSS, JS, Images): Cache-First
When the browser requests a static asset, the Service Worker checks the cache first.
- **Cache Hit**: The asset is returned instantly from local storage, bypassing the network entirely. This significantly improves LCP and Core Web Vitals on repeat visits.
- **Cache Miss**: The Service Worker fetches the asset from the network.
- **Dynamic Caching**: Upon a successful network fetch for a missing asset (status 200, GET request), the response is cloned and placed into the cache for future use.

*Why Cache-First?* Assets like CSS, JS, and Images are immutable or change rarely. Fetching them from the network every time is redundant and slows down page rendering.

## Cache Management
- **Name**: `mushclub-cache-v1`
- **Invalidation**: When the cache name is incremented (e.g., to `v2`) in future updates, the `activate` event will automatically wipe `v1` and fetch fresh copies of all assets.
