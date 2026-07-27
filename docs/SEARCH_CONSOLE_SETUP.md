# Google Search Console Setup

## Objective
Enable Google Search Console (GSC) to monitor indexing status, search queries, and Core Web Vitals.

## Steps for Integration
1. Go to [Google Search Console](https://search.google.com/search-console/about).
2. Click **Add Property**.
3. Select **Domain Property** (Recommended) and enter `mushclub.in`.
4. Verify ownership via DNS record:
   - Copy the provided TXT record.
   - Go to your DNS provider.
   - Create a new TXT record for `@` (root) and paste the value.
5. Return to GSC and click **Verify**.
6. Once verified, navigate to **Sitemaps** in the left sidebar.
7. Submit the URL: `https://mushclub.in/sitemap.xml`.

## Validation
Google will crawl the sitemap within 48 hours. Monitor the "Pages" report for indexing errors.
