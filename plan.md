# FinzProperty implementation plan

## Scope

Deliver a polished, functional marketplace-first FinzProperty web app in vertical slices. The first release centers on a high-conversion homepage, real client-side marketplace interactions, browsable listings, rich property details, favourites, search/filter state, an agent directory, and a role-aware account/admin preview entry point. The backend schema and tRPC surface will support durable property records, saved favourites, enquiries, and moderation while the UI remains useful with seeded records when the database is empty.

## Implementation approach

Use the initialized React + TypeScript + Vite frontend with Tailwind and the existing Radix primitives. Extend the existing Drizzle MySQL schema with properties, agents, favourites, enquiries, saved searches, developments, and listing media. Add tRPC procedures for public listing search/detail, agent search, favourites, enquiries, and owner/admin summaries. Seed a small set of clearly marked development properties if the database is empty. Keep authentication on the existing Manus OAuth/session foundation and gate mutations through protected procedures.

The first implementation pass will prioritize the public marketplace UX and a cohesive visual system. The landing page will expose working search tabs and filters that route to a results page. Listing data will be shareable through URL query parameters. Property details will support gallery navigation, favourite toggling, contact and viewing-request forms with success feedback. The admin page will be a functional data-backed shell for moderation metrics and recent listings, with clear next-step states for unfinished operational tools.

## Design system

### Candidate styles

- Editorial Coastal Modernism — 0.07: premium magazine-like real-estate discovery with coastal light and warm neutrals.
- Quiet Luxury Marketplace — 0.06: navy, champagne, and ivory with restrained borders and high-trust detail.
- Urban Grid Utility — 0.08: high-density portal controls with practical, data-forward navigation.

**Chosen style: Quiet Luxury Marketplace.**

**Design movement:** Quiet luxury editorial real estate, adapted for Sri Lankan property discovery.

**Core principles:** calm confidence, location-first clarity, premium restraint, and practical trust signals.

**Color philosophy:** deep navy anchors trust and structure; ivory and sand keep image-led pages warm; champagne gold marks attention without turning the site flashy; sage accents signal verification and successful actions.

**Layout paradigm:** wide editorial bands and asymmetrical hero composition, with a floating search panel that bridges photography and the results experience. Property cards use a soft stagger between featured content and dense utility rows.

**Signature elements:** a champagne-gold property-pin mark in the logo, pill-shaped intent tabs, and small “verified / featured” seals paired with fine divider rules.

**Interaction philosophy:** every interaction should reduce search effort. Filters preserve context, favourite actions give immediate visual confirmation, and forms explain what happens next.

**Animation:** 180–260ms ease-out fades and small lifts for cards; search panel fields transition with subtle border/glow changes; no looping decorative motion.

**Typography system:** use DM Sans for interface clarity and Manrope for display hierarchy, with tighter tracking on uppercase metadata and generous line height in descriptions.

**Brand essence:** Sri Lanka’s considered property marketplace for people who want less noise and more confidence. Personality: composed, discerning, helpful.

**Brand voice:** headlines are direct and aspirational; CTAs are specific and reassuring. Examples: “Find a place that fits your next chapter.” and “Save this search and we’ll bring new matches to you.”

**Wordmark & logo:** a compact pin/roof monogram beside a custom wordmark, using a gold inset notch to suggest a doorway.

**Signature brand color:** Finz Gold `#D8B66A`.

## Project structure

- `client/src/pages`: route-level screens for home, results, property details, agents, account, and admin.
- `client/src/components`: reusable marketplace shell, cards, filters, badges, and forms.
- `client/src/lib`: tRPC client and formatting helpers.
- `server/routers.ts`: public and authenticated tRPC procedures.
- `server/db.ts`: database access and seed-aware queries.
- `drizzle/schema.ts`: users and marketplace tables.
- `public/manus-routes.json`: route manifest kept in sync with source.

## Delivery workflow

1. Create plan and TODO, register TypeScript diagnostics, and add logo metadata.
2. Implement schema/query layer and seed-aware tRPC procedures.
3. Implement homepage, results, property details, agents, account, and admin screens.
4. Add responsive visual polish, metadata, route manifest, and loading/empty/error states.
5. Run typecheck, tests, build, start Preview, verify health and route manifest, and save a checkpoint.

## Research-led public portal expansion — 9 November 2026

The user requests LankaPropertyWeb's functional breadth inside FinzProperty, explicitly excluding every Post Your Ad/property-ad creation option. Preserve the supplied FINZ PROPERTY logo and existing navy/gold design. Audit six public feature areas in parallel and record observed controls, official sources, uncertainty, and dependencies in `research/`. Do not copy reference branding, source code, listing inventories, articles, or market datasets.

Implement the confirmed public/seeker workflows in connected vertical slices: advanced URL-backed search and usable location/category browsing; working pagination, comparison, real maps, favourites and saved searches; property enquiries and reports that persist before showing success; authentic account navigation with private query-backed activity; development/project discovery and functional numerical tools; original guides/news/resource routes and visitor contact/support. Additional reference features discovered by research are added to the checklist before their implementation. Do not fabricate live projects, agent counts, financial rates, market indices, customer email delivery, or listing verification. Label demonstration records clearly. Where an external service, contact channel, or licensed dataset is missing, show an honest unavailable state or an explicit request workflow rather than a fake result.

Use the current React/tRPC/Drizzle structure. Separate portal persistence in `server/portal.ts`, shared filtering and numerical calculations in focused `shared/` modules, portal tools/content in dedicated page modules, and cross-page local visitor state in a client hook. Preserve Manus OAuth; add authenticated, ownership-scoped saved-search/profile/enquiry/report/account operations and administrator-only review operations. All primary actions must have validation, loading, failure, empty and success handling. Anonymous visitor favourites/comparison/recent views may use local browser storage, labeled as this-device state; signed-in favourites and saved searches must use the database. Saved-search notifications are in-app unless a customer-email provider is configured.

Apply additive migrations, use one-time explicitly labeled demonstration seeding only where necessary, and preserve existing records. Keep route declarations synchronized, use browser-relative URLs, and check real server endpoints and existing build/tests. Finish with one read-only implementation validation agent and resolve confirmed defects. Save the intended changes to the canonical repository; do not publish unless separately authorized.
