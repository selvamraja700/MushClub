# AI EXTRACTION SIMULATION (BEFORE IMPLEMENTATION)

## Objective
Simulate an AI crawler (e.g., ChatGPT Search, Perplexity) querying the domain `https://mushclubb.netlify.app/` before deep semantic tagging and metadata injection.

## Simulated Query: "What is MushClubb?"

### Extracted Entities
- **Organization Name:** MushClub / THE MUSH CLUB (Inconsistent capitalization in raw HTML)
- **Industry:** Premium Mushroom Cultivation (Inferred from generic paragraph text)
- **Products:** 
  - Fresh Button Mushrooms (Found in `products.html` list, but lacks Schema `Product` definition)
  - Gourmet Oyster Mushrooms (Found in `products.html` list)
  - Grain Spawn (Found in `products.html` list)
- **Mission:** "To make fresh, organic mushrooms accessible..." (Present in `knowledge-base.json`, but missing from primary HTML metadata and structured schemas).
- **Website:** https://mushclubb.netlify.app/
- **Contact:** +91 7395841171 (Present in footer, but lacks `ContactPoint` Schema)

### AI Confidence Score (Estimated)
- **Entity Identification Confidence:** 70% (The `company.json` and `ai-context.txt` exist, which saves the score, but the HTML itself lacks microdata to reinforce it).
- **Product Extraction Confidence:** 40% (Products are in an unstructured `<ul>` list on `products.html` without `itemprop="model"` or `Product` JSON-LD).
- **Target Audience Confidence:** 50% (Requires NLP to infer from paragraphs; no explicit entity tagging).

### Deficiencies to Address
1. The AI relies heavily on parsing generic `<div>` text nodes.
2. Lack of `itemscope` and `itemtype="https://schema.org/Organization"` in the HTML body means the AI has to guess which text block represents the official company description vs. marketing fluff.
3. No `Product` structured data, meaning search engines will not surface rich product cards.
