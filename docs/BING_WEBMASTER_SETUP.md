# Bing Webmaster Tools Setup

## Objective
Enable Bing Webmaster Tools to ensure visibility on Bing, Yahoo, and DuckDuckGo search engines.

## Steps for Integration
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters/about).
2. Sign in with a Microsoft, Google, or Facebook account.
3. **Easiest Method**: If Google Search Console is already set up (see `SEARCH_CONSOLE_SETUP.md`), click **Import from Google Search Console**. Follow the prompts to clone your verified property.
4. **Manual Method**:
   - Add your site manually: `https://mushclub.in`.
   - Verify via DNS (similar to Google) or via the provided XML file.
5. Navigate to **Sitemaps**.
6. Submit: `https://mushclub.in/sitemap.xml`.

## Validation
Bing will ingest the site data. Monitor the "Site Explorer" to verify URL discovery.
