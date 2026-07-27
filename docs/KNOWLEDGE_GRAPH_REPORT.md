# Knowledge Graph Report

## Overview
A Knowledge Graph maps the relationship between entities. Search Engines use this to populate rich panels and understand topical authority.

## Entity Relationships Established
1. **Primary Entity**: `Organization` (MushClub)
2. **Sub-Entity (Location)**: `LocalBusiness` (MushClub Farm in Tirunelveli). The graphs merge via identical contact arrays and domains.
3. **Sub-Entity (Offerings)**: `ItemList` (Products/Services). Connected to the primary entity via internal canonical linking.
4. **Sub-Entity (FAQ)**: `FAQPage` schema explicitly answers queries regarding the Primary Entity's operations and organic claims.

## Recommendations for Future Scaling
Currently, the knowledge graph relies heavily on the `index.html` schema and the semantic density of subpages. As the site scales, consider interlinking the JSON-LD schemas directly (e.g., nesting the `ItemList` inside the `Organization` schema via a `hasOfferCatalog` property).

## Validation Results
✅ Entity relationships are logical and supported by both code and content.
✅ No orphan entities exist.
